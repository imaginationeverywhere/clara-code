import * as vscode from "vscode";
import { showHttpError } from "./doctor";

const AUTH_BASE = "https://claracode.ai/cli-auth";

export function registerPaletteCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.login", async () => {
			const port = 9_876 + Math.floor(Math.random() * 1_000);
			const url = `${AUTH_BASE}?source=ide&port=${port}`;
			void vscode.env.openExternal(vscode.Uri.parse(url));
			void vscode.window.showInformationMessage(
				"Complete sign-in in the browser. The IDE will store the token when the flow supports this port (use `clara login` in the terminal today).",
			);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("clara.newAgent", async () => {
			const name = await vscode.window.showInputBox({ prompt: "New agent name (kebab-case)" });
			if (!name?.trim()) {
				return;
			}
			const backend = process.env.CLARA_BACKEND_URL?.trim() || "https://api.claracode.ai";
			const token = await context.secrets.get("clara.token");
			if (!token) {
				void vscode.window.showErrorMessage("Run `Clara: Login` or `clara login` first.");
				return;
			}
			try {
				const r = await fetch(`${backend}/api/agents/init`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ name: name.trim() }),
				});
				const text = await r.text();
				if (!r.ok) {
					showHttpError(r.status, text);
					return;
				}
				const j = JSON.parse(text) as { cloneUrl?: string };
				if (j.cloneUrl) {
					const pick = await vscode.window.showOpenDialog({ canSelectFolders: true, openLabel: "Clone here" });
					if (pick?.[0]) {
						void vscode.window.showInformationMessage(
							`Repository created. Run: git clone ${j.cloneUrl} in the chosen folder (terminal).`,
						);
					}
				} else {
					void vscode.window.showInformationMessage("Agent init accepted.");
				}
			} catch (e) {
				void vscode.window.showErrorMessage(e instanceof Error ? e.message : String(e));
			}
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("clara.runDeploy", async () => {
			const folders = vscode.workspace.workspaceFolders;
			if (!folders?.length) {
				void vscode.window.showErrorMessage("Open a workspace folder first.");
				return;
			}
			const name = folders[0].name;
			const backend = process.env.CLARA_BACKEND_URL?.trim() || "https://api.claracode.ai";
			const token = await context.secrets.get("clara.token");
			if (!token) {
				void vscode.window.showErrorMessage("Run `Clara: Login` or `clara login` first.");
				return;
			}
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: "Clara: Deploy",
					cancellable: true,
				},
				async (progress, cancel) => {
					progress.report({ message: "Requesting deploy…" });
					const c = new AbortController();
					cancel.onCancellationRequested(() => c.abort());
					const r = await fetch(`${backend}/api/agents/${encodeURIComponent(name)}/deploy`, {
						method: "POST",
						headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
						body: JSON.stringify({}),
						signal: c.signal,
					});
					const text = await r.text();
					if (!r.ok) {
						showHttpError(r.status, text);
						return;
					}
					if (text.trim().length) {
						void vscode.window.showInformationMessage(`Deploy: ${text.slice(0, 200)}`);
					} else {
						void vscode.window.showInformationMessage("Deploy request sent.");
					}
				},
			);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("clara.openPricing", () => {
			void vscode.env.openExternal(vscode.Uri.parse("https://claracode.ai/pricing"));
		}),
	);
}
