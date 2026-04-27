import * as vscode from "vscode";
import { GATEWAY_SECRET_KEY, GATEWAY_URL_PLACEHOLDER } from "../constants";

export function registerDevCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.setGatewayUrl", async () => {
			const url = await vscode.window.showInputBox({
				prompt: "Clara gateway URL (leave blank to clear stored URL; use CLARA_GATEWAY_URL if unset)",
				placeHolder: GATEWAY_URL_PLACEHOLDER,
			});
			if (url === undefined) return;
			if (url === "") {
				await context.secrets.delete(GATEWAY_SECRET_KEY);
				void vscode.window.showInformationMessage("Gateway URL cleared from Secret Storage.");
			} else {
				await context.secrets.store(GATEWAY_SECRET_KEY, url);
				void vscode.window.showInformationMessage("Gateway URL updated.");
			}
		}),
	);
}
