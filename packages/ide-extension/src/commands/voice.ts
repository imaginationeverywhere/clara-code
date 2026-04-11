import * as vscode from "vscode";
import type { ClaraPanelProvider } from "../ClaraPanelProvider";

export function registerVoiceCommand(context: vscode.ExtensionContext, provider: ClaraPanelProvider): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.voice", () => {
			void vscode.commands.executeCommand("workbench.view.extension.clara-sidebar");
			provider.toggleMic();
		}),
	);
}
