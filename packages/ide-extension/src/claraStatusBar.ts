import * as vscode from "vscode";
import { DEFAULT_GATEWAY_URL, GATEWAY_SECRET_KEY } from "./constants";
import { parseMinutesFromResponse } from "./minutes";

export class ClaraStatusBarController implements vscode.Disposable {
	private readonly tier: vscode.StatusBarItem;
	private readonly health: vscode.StatusBarItem;
	private interval: ReturnType<typeof setInterval> | undefined;

	constructor(private readonly context: vscode.ExtensionContext) {
		this.tier = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
		this.tier.command = "clara.openPricing";
		this.health = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		this.health.command = "clara.doctor";
	}

	async activate(): Promise<void> {
		this.tier.text = "$(hubot) Clara";
		this.tier.tooltip = "Clara Code";
		this.health.text = "$(circle-large-outline)";
		this.health.tooltip = "Gateway: checking…";
		this.tier.show();
		this.health.show();
		void this.probe();
		this.interval = setInterval(() => void this.probe(), 60_000);
	}

	private async probe(): Promise<void> {
		const url = (await this.context.secrets.get(GATEWAY_SECRET_KEY))?.trim() || DEFAULT_GATEWAY_URL;
		const ctrl = new AbortController();
		const t = setTimeout(() => ctrl.abort(), 5_000);
		try {
			const r = await fetch(url, { method: "HEAD", signal: ctrl.signal });
			clearTimeout(t);
			const m = parseMinutesFromResponse(r);
			const min = m != null ? ` · ${m} min` : "";
			this.tier.text = `$(hubot) Clara${min}`;
			this.health.text = r.ok ? "$(pass)" : "$(warning)";
			this.health.tooltip = r.ok ? "Gateway: ok" : "Gateway: degraded";
		} catch {
			clearTimeout(t);
			this.health.text = "$(error)";
			this.health.tooltip = "Gateway: unreachable";
		}
	}

	dispose(): void {
		if (this.interval) {
			clearInterval(this.interval);
		}
		this.tier.dispose();
		this.health.dispose();
	}
}
