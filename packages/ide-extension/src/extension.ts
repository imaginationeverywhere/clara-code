import * as vscode from "vscode";
import { AgentTrayProvider } from "./agentTray";
import { ClaraPanelProvider } from "./ClaraPanelProvider";
import { ClaraStatusBarController } from "./claraStatusBar";
import { registerAskGranville } from "./commands/askGranville";
import { registerDevCommands } from "./commands/dev";
import { registerIdeDoctor } from "./commands/doctor";
import { registerExplainCommand } from "./commands/explain";
import { registerInlineThink } from "./commands/inlineThink";
import { registerPaletteCommands } from "./commands/paletteCommands";
import { registerStartCommand } from "./commands/start";
import { registerVoiceCommand } from "./commands/voice";

export function activate(context: vscode.ExtensionContext): void {
	const provider = new ClaraPanelProvider(context.extensionUri, context);

	registerDevCommands(context);
	registerIdeDoctor(context);
	registerPaletteCommands(context);
	registerInlineThink(context);
	registerAskGranville(context);
	registerClaraStatusBar(context);

	const tray = new AgentTrayProvider(() => context.secrets.get("clara.token"));
	const tree = vscode.window.createTreeView("clara.agentTray", {
		treeDataProvider: tray,
	});
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.refreshAgents", () => tray.refresh()),
		tree,
	);
	const refreshTimer = setInterval(() => tray.refresh(), 60_000);
	context.subscriptions.push(new vscode.Disposable(() => clearInterval(refreshTimer)));

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("clara.panel", provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	);

	registerStartCommand(context, provider);
	registerVoiceCommand(context, provider);
	registerExplainCommand(context, provider);

	registerVoiceStatusItem(context);
}

function registerClaraStatusBar(context: vscode.ExtensionContext): void {
	const c = new ClaraStatusBarController(context);
	context.subscriptions.push(c);
	void c.activate();
}

function registerVoiceStatusItem(context: vscode.ExtensionContext): void {
	const s = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
	s.text = "$(mic) voice";
	s.tooltip = "Clara: Toggle voice";
	s.command = "clara.voice";
	s.show();
	context.subscriptions.push(s);
}

export function deactivate(): void {}
