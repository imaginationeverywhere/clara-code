import * as vscode from "vscode";
import type { ClaraPanelProvider } from "../ClaraPanelProvider";

export function registerExplainCommand(context: vscode.ExtensionContext, provider: ClaraPanelProvider): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.explain", () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) return;

			const selection = editor.selection;
			const code = editor.document.getText(selection);

			if (!code.trim()) {
				void vscode.window.showWarningMessage("Clara: Select code to explain first.");
				return;
			}

			const language = editor.document.languageId;

			void vscode.commands.executeCommand("workbench.view.extension.clara-sidebar");
			provider.explainCode(code, language);
		}),
	);
}
