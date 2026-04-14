import * as vscode from "vscode";

const VOICE_WS_SUFFIX = "/voice/stream";

function resolveVoiceServerUrl(): string {
	const fromSetting = vscode.workspace.getConfiguration().get<string>("clara.voice.serverUrl")?.trim() ?? "";
	if (fromSetting.length > 0) {
		return fromSetting.replace(/\/$/, "");
	}
	const fromEnv = process.env.CLARA_VOICE_SERVER_URL?.trim() ?? "";
	return fromEnv.replace(/\/$/, "");
}

function toWebSocketUrl(base: string): string {
	const trimmed = base.replace(/\/$/, "");
	if (trimmed.startsWith("wss://") || trimmed.startsWith("ws://")) {
		return trimmed.includes("/voice") ? trimmed : `${trimmed}${VOICE_WS_SUFFIX}`;
	}
	if (trimmed.startsWith("https://")) {
		return `wss://${trimmed.slice("https://".length)}${VOICE_WS_SUFFIX}`;
	}
	if (trimmed.startsWith("http://")) {
		return `ws://${trimmed.slice("http://".length)}${VOICE_WS_SUFFIX}`;
	}
	return `wss://${trimmed}${VOICE_WS_SUFFIX}`;
}

export function activate(context: vscode.ExtensionContext): void {

	const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	status.command = "clara.voice.toggle";
	status.tooltip = "Clara Voice: start/stop (Cmd+Shift+V)";
	updateStatusLabel(status, false);
	status.show();

	let socket: WebSocket | undefined;
	let isRecording = false;
	let isConnecting = false;

	const toggle = async (): Promise<void> => {
		const base = resolveVoiceServerUrl();
		if (!isRecording) {
			if (isConnecting) return;
			if (base.length === 0) {
				void vscode.window.showErrorMessage(
					"Clara Voice: set clara.voice.serverUrl or CLARA_VOICE_SERVER_URL.",
				);
				return;
			}
			const wsUrl = toWebSocketUrl(base);
			isConnecting = true;
			try {
				socket = new WebSocket(wsUrl);
			} catch (e) {
				isConnecting = false;
				const message = e instanceof Error ? e.message : String(e);
				void vscode.window.showErrorMessage(`Clara Voice: could not connect (${message}).`);
				return;
			}
			socket.addEventListener("open", () => {
				isConnecting = false;
				isRecording = true;
				updateStatusLabel(status, true);
			});
			socket.addEventListener("error", () => {
				isConnecting = false;
				void vscode.window.showWarningMessage("Clara Voice: connection error.");
			});
			socket.addEventListener("close", () => {
				isConnecting = false;
				isRecording = false;
				updateStatusLabel(status, false);
				socket = undefined;
			});
			return;
		}
		socket?.close();
		socket = undefined;
		isRecording = false;
		updateStatusLabel(status, false);
	};

	const disposableToggle = vscode.commands.registerCommand("clara.voice.toggle", () => {
		void toggle();
	});

	const codeLensProvider: vscode.CodeLensProvider = {
		provideCodeLenses(doc: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
			const enabled = vscode.workspace.getConfiguration().get<boolean>("clara.codeLens.enabled");
			if (enabled === false) {
				return [];
			}
			const range = doc.lineAt(0).range;
			const lens = new vscode.CodeLens(range, {
				title: "Clara",
				tooltip: "Clara Code Lens",
				command: "clara.codeLens.open",
				arguments: [doc.uri],
			});
			return [lens];
		},
	};

	const disposableCodeLens = vscode.languages.registerCodeLensProvider(
		{ scheme: "file" },
		codeLensProvider,
	);

	const disposableOpen = vscode.commands.registerCommand("clara.codeLens.open", (uri: vscode.Uri) => {
		void vscode.window.showInformationMessage(`Clara: active file ${uri.fsPath}`);
	});

	context.subscriptions.push(status, disposableToggle, disposableCodeLens, disposableOpen);
}

function updateStatusLabel(item: vscode.StatusBarItem, recording: boolean): void {
	item.text = recording ? "$(mic-filled) Clara Voice" : "$(mic) Clara Voice";
	item.backgroundColor = recording ? new vscode.ThemeColor("statusBarItem.warningBackground") : undefined;
}

export function deactivate(): void {
	// WebSocket closed by host on shutdown
}
