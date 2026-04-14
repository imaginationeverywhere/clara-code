import * as vscode from "vscode";
import { DEFAULT_GATEWAY_URL, GATEWAY_SECRET_KEY } from "../constants";

export function registerDevCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.setGatewayUrl", async () => {
			const url = await vscode.window.showInputBox({
				prompt: "Clara gateway URL (leave blank to reset to default)",
				placeHolder: DEFAULT_GATEWAY_URL,
			});
			if (url === undefined) {
				return;
			}
			if (url === "") {
				await context.secrets.delete(GATEWAY_SECRET_KEY);
				void vscode.window.showInformationMessage("Gateway URL reset to default.");
			} else {
				await context.secrets.store(GATEWAY_SECRET_KEY, url);
				void vscode.window.showInformationMessage("Gateway URL updated.");
			}
		}),
	);
}
