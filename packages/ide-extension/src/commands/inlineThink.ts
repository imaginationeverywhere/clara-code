import * as vscode from "vscode";
import { DEFAULT_GATEWAY_URL, GATEWAY_SECRET_KEY } from "../constants";
import { mapHttpErrorToString, NETWORK_FAILURE_MESSAGE } from "../http-errors";

export function registerInlineThink(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.askInline", async () => {
			const ed = vscode.window.activeTextEditor;
			const selection = ed?.document.getText(ed.selection) ?? "";
			const gateway = (await context.secrets.get(GATEWAY_SECRET_KEY))?.trim() || DEFAULT_GATEWAY_URL;
			const base = gateway.replace(/\/$/, "");
			const url = `${base}/v1/think`;
			const token = await context.secrets.get("clara.token");
			if (!token) {
				void vscode.window.showErrorMessage("Run `Clara: Login` or `clara login` first.");
				return;
			}
			const prompt = await vscode.window.showInputBox({ prompt: "Clara: ask (inline think)" });
			if (prompt == null) {
				return;
			}
			const body: Record<string, unknown> = {
				surface: "ide",
				intent: "think",
				prompt,
				...(selection ? { selection, language: ed?.document.languageId } : {}),
			};
			try {
				const r = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(body),
				});
				const text = await r.text();
				if (!r.ok) {
					void vscode.window.showErrorMessage(mapHttpErrorToString(r.status, text));
					return;
				}
				let reply = text;
				try {
					const j = JSON.parse(text) as { reply?: string; text?: string };
					reply = j.reply ?? j.text ?? text;
				} catch {
					// use raw
				}
				void vscode.window.showInformationMessage(reply.slice(0, 400), "Dismiss");
			} catch (e) {
				void vscode.window.showErrorMessage(e instanceof Error ? e.message : NETWORK_FAILURE_MESSAGE);
			}
		}),
	);
}
