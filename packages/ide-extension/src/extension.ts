import * as vscode from "vscode";
import { ClaraPanelProvider } from "./ClaraPanelProvider";
import { registerDevCommands } from "./commands/dev";
import { registerExplainCommand } from "./commands/explain";
import { registerStartCommand } from "./commands/start";
import { registerVoiceCommand } from "./commands/voice";

export function activate(context: vscode.ExtensionContext): void {
	const provider = new ClaraPanelProvider(context.extensionUri, context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("clara.panel", provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	);

	registerStartCommand(context, provider);
	registerVoiceCommand(context, provider);
	registerExplainCommand(context, provider);
	registerDevCommands(context);

	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBar.text = "$(mic) Clara";
	statusBar.tooltip = "Clara Code — Toggle Voice (Ctrl+Shift+Space)";
	statusBar.command = "clara.voice";
	statusBar.show();
	context.subscriptions.push(statusBar);
}

export function deactivate(): void {}
