import {
	detectPartnerTypeFromFirstMessage,
	ideFirstLaunchGreeting,
	ideScripts,
	type PartnerType,
	panelScripts,
	sixSideProjectsQuestion,
} from "@clara/clara-code-surface-scripts";
import * as vscode from "vscode";

const GK = {
	firstLaunchDone: "clara.firstLaunchDone",
	lastTask: "clara.lastTask",
	lastProject: "clara.lastProject",
	sixSideProjectsAsked: "clara.sixSideProjectsAsked",
	userExchangeCount: "clara.userExchangeCount",
	partnerType: "clara.partnerType",
} as const;

function getNonce(): string {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

async function readPackageJson(root: vscode.Uri): Promise<{ name: string; deps: string[] } | null> {
	try {
		const pkgUri = vscode.Uri.joinPath(root, "package.json");
		const bytes = await vscode.workspace.fs.readFile(pkgUri);
		const pkg = JSON.parse(Buffer.from(bytes).toString("utf8")) as {
			name?: string;
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
		};
		const deps = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
		return { name: pkg.name ?? "project", deps };
	} catch {
		return null;
	}
}

function summarizeStack(deps: string[]): string {
	if (deps.includes("next")) return "Next.js stack";
	if (deps.includes("react")) return "React stack";
	if (deps.includes("@vitejs/plugin-react")) return "Vite + React";
	if (deps.includes("typescript")) return "TypeScript project";
	return "Node project";
}

export class ClaraPanelProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _context: vscode.ExtensionContext,
	) {}

	resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	): void {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		const config = vscode.workspace.getConfiguration("claraCode");
		const gatewayUrl = config.get<string>("gatewayUrl", "https://info-24346--hermes-gateway.modal.run");
		webviewView.webview.html = this._getHtmlContent(webviewView.webview, gatewayUrl);

		webviewView.webview.onDidReceiveMessage(
			async (message: { type: string; text?: string; payload?: unknown }) => {
				switch (message.type) {
					case "ready":
						await this._sendInit();
						break;
					case "voice-input":
						await this._handleVoiceInput(message.text ?? "");
						break;
					case "get-api-key":
						await this._sendApiKey();
						break;
					case "save-api-key":
						await this._context.secrets.store("clara.apiKey", message.text ?? "");
						break;
					default:
						break;
				}
			},
			undefined,
			this._context.subscriptions,
		);
	}

	postMessage(type: string, payload?: unknown): void {
		this._view?.webview.postMessage({ type, payload });
	}

	toggleMic(): void {
		this.postMessage("toggle-mic");
	}

	explainCode(code: string, language: string): void {
		this.postMessage("explain-code", { code, language });
	}

	private _surface(): "ide" | "panel" {
		const panelMode = vscode.workspace.getConfiguration("claraCode").get<boolean>("panelMode", false);
		return panelMode ? "panel" : "ide";
	}

	private async _sendInit(): Promise<void> {
		const surface = this._surface();
		const name = vscode.workspace.getConfiguration("claraCode").get<string>("userId", "dev")?.trim() || "there";
		const firstDone = this._context.globalState.get<boolean>(GK.firstLaunchDone) ?? false;
		const lastTask = this._context.globalState.get<string>(GK.lastTask) ?? null;
		const sixAsked = this._context.globalState.get<boolean>(GK.sixSideProjectsAsked) ?? false;

		if (surface === "panel") {
			this.postMessage("init", {
				surface: "panel",
				initialMessages: [{ role: "assistant", text: panelScripts.d1 }],
				userName: name,
				sixSideProjectsAsked: sixAsked,
			});
			return;
		}

		const folders = vscode.workspace.workspaceFolders;
		const pkg = folders?.length ? await readPackageJson(folders[0].uri) : null;

		if (firstDone && lastTask) {
			const lines = ideScripts.b4.voiceLines(name, lastTask).filter((l) => l !== "(pause)");
			this.postMessage("init", {
				surface: "ide",
				initialMessages: lines.map((text) => ({ role: "assistant" as const, text })),
				userName: name,
				sixSideProjectsAsked: sixAsked,
			});
			return;
		}

		if (pkg) {
			const stack = summarizeStack(pkg.deps);
			await this._context.globalState.update(GK.firstLaunchDone, true);
			await this._context.globalState.update(GK.lastProject, pkg.name);
			this.postMessage("init", {
				surface: "ide",
				initialMessages: [
					{ role: "assistant", text: ideScripts.b3.scanningLine },
					{
						role: "assistant",
						text: ideScripts.b3.summaryLine(pkg.name, stack),
					},
				],
				userName: name,
				sixSideProjectsAsked: sixAsked,
			});
			return;
		}

		if (!folders?.length) {
			await this._context.globalState.update(GK.firstLaunchDone, true);
			this.postMessage("init", {
				surface: "ide",
				initialMessages: [{ role: "assistant", text: ideScripts.b2.voiceLines[0] }],
				userName: name,
				sixSideProjectsAsked: sixAsked,
			});
			return;
		}

		if (!firstDone) {
			const g = ideFirstLaunchGreeting(name);
			await this._context.globalState.update(GK.firstLaunchDone, true);
			this.postMessage("init", {
				surface: "ide",
				initialMessages: g.lines.map((text) => ({ role: "assistant" as const, text })),
				userName: name,
				sixSideProjectsAsked: sixAsked,
			});
			return;
		}

		this.postMessage("init", {
			surface: "ide",
			initialMessages: [{ role: "assistant", text: "What are we opening?" }],
			userName: name,
			sixSideProjectsAsked: sixAsked,
		});
	}

	private async _handleVoiceInput(text: string): Promise<void> {
		const config = vscode.workspace.getConfiguration("claraCode");
		const gatewayUrl = config.get<string>("gatewayUrl", "https://info-24346--hermes-gateway.modal.run");
		const userId = config.get<string>("userId", "dev");
		const surface = this._surface();

		const count = this._context.globalState.get<number>(GK.userExchangeCount) ?? 0;
		let partnerType = (this._context.globalState.get<string>(GK.partnerType) ?? "unknown") as PartnerType;
		if (count === 0) {
			partnerType = detectPartnerTypeFromFirstMessage(text);
			await this._context.globalState.update(GK.partnerType, partnerType);
		}
		const sixAsked = this._context.globalState.get<boolean>(GK.sixSideProjectsAsked) ?? false;

		const session = {
			surface,
			isFirstSession: count === 0,
			isAuthenticated: true,
			githubConnected: true,
			lastSessionDate: null as string | null,
			lastProject: vscode.workspace.workspaceFolders?.[0]?.name ?? null,
			lastTask: this._context.globalState.get<string>(GK.lastTask),
			sixSideProjectsAsked: sixAsked,
			partnerType,
		};

		try {
			const response = await fetch(gatewayUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					platform: "vscode",
					surface,
					user: userId,
					message: text,
					partnerType,
					sixSideProjectsAsked: sixAsked,
					session,
				}),
			});

			if (!response.ok) {
				throw new Error(`Gateway error: ${response.status}`);
			}

			const data = (await response.json()) as { reply?: string; text?: string };
			const reply = data.reply ?? data.text ?? "Clara is thinking...";

			await this._context.globalState.update(GK.userExchangeCount, count + 1);
			await this._context.globalState.update(GK.lastTask, text.slice(0, 120));

			this.postMessage("voice-reply", { text: reply });

			const newCount = count + 1;
			const shouldAskSix = partnerType === "developer" && newCount === 1 && !sixAsked && surface === "ide";

			if (shouldAskSix) {
				await this._context.globalState.update(GK.sixSideProjectsAsked, true);
				this.postMessage("voice-reply", { text: sixSideProjectsQuestion });
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			this.postMessage("voice-error", { message: msg });
			void vscode.window.showErrorMessage(`Clara gateway error: ${msg}`);
		}
	}

	private async _sendApiKey(): Promise<void> {
		const key = await this._context.secrets.get("clara.apiKey");
		this.postMessage("api-key", { key: key ?? "" });
	}

	private _getHtmlContent(webview: vscode.Webview, gatewayUrl: string): string {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist", "webview.js"));
		const nonce = getNonce();
		const connectSrc = new URL(gatewayUrl).origin;

		return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src ${connectSrc} https:;" />
  <title>Clara</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--vscode-sideBar-background, #0d0d1a);
      color: var(--vscode-sideBar-foreground, #e2e8f0);
      font-family: var(--vscode-font-family, 'Inter', sans-serif);
      height: 100vh;
      overflow: hidden;
    }
    #root { height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
	}
}
