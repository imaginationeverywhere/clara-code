import * as vscode from "vscode";
import { mapHttpErrorToString } from "./http-errors";

type AgentRow = { name: string; status: string; excerpt: string };

export class AgentTrayProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private readonly _onDidChange = new vscode.EventEmitter<void>();
	readonly onDidChangeTreeData = this._onDidChange.event;

	constructor(private readonly getToken: () => Thenable<string | undefined>) {}

	refresh(): void {
		this._onDidChange.fire();
	}

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	async getChildren(): Promise<vscode.TreeItem[]> {
		const token = await this.getToken();
		const backend = process.env.CLARA_BACKEND_URL?.trim() || "https://api.claracode.ai";
		if (!token) {
			const it = new vscode.TreeItem("Sign in to list agents");
			it.iconPath = new vscode.ThemeIcon("key");
			return [it];
		}
		try {
			const r = await fetch(`${backend}/api/agents/mine`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const text = await r.text();
			if (!r.ok) {
				const err = new vscode.TreeItem(mapHttpErrorToString(r.status, text));
				err.iconPath = new vscode.ThemeIcon("error");
				return [err];
			}
			const j = JSON.parse(text) as { agents?: AgentRow[] };
			const rows = Array.isArray(j.agents) ? j.agents : [];
			if (rows.length === 0) {
				const it = new vscode.TreeItem("No agents yet — use `Clara: New Agent`");
				return [it];
			}
			return rows.map((a) => {
				const it = new vscode.TreeItem(a.name, vscode.TreeItemCollapsibleState.None);
				it.description = a.status;
				it.tooltip = a.excerpt;
				it.iconPath = new vscode.ThemeIcon("person");
				return it;
			});
		} catch (e) {
			const it = new vscode.TreeItem(e instanceof Error ? e.message : "Request failed");
			return [it];
		}
	}
}
