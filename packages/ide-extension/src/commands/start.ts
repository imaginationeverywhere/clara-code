import * as vscode from "vscode";
import type { ClaraPanelProvider } from "../ClaraPanelProvider";

export function registerStartCommand(context: vscode.ExtensionContext, provider: ClaraPanelProvider): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.start", () => {
			void vscode.commands.executeCommand("workbench.view.extension.clara-sidebar");
			provider.postMessage("focus");
		}),
	);
}
