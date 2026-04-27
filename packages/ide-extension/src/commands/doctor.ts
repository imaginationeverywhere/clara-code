import * as vscode from "vscode";
import { DEFAULT_GATEWAY_URL, GATEWAY_SECRET_KEY } from "../constants";
import { mapHttpErrorToString, NETWORK_FAILURE_MESSAGE } from "../http-errors";

const OUT = "Clara Doctor";

async function probeLabel(url: string, label: string, mode: "head" | "get"): Promise<string> {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), 5_000);
	try {
		const r = await fetch(url, { method: mode === "head" ? "HEAD" : "GET", signal: ctrl.signal });
		clearTimeout(t);
		return `ok  ${label} ${url} — HTTP ${r.status}`;
	} catch (e) {
		clearTimeout(t);
		return `err ${label} ${url} — ${e instanceof Error ? e.message : String(e)}`;
	}
}

export function registerIdeDoctor(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.doctor", async () => {
			const ch = vscode.window.createOutputChannel(OUT);
			ch.clear();
			ch.show(true);
			const gw = (await context.secrets.get(GATEWAY_SECRET_KEY))?.trim() || DEFAULT_GATEWAY_URL;
			const lines: string[] = [];
			lines.push(await probeLabel(gw, "gateway", "head"));
			const brain = process.env.CLARA_BRAIN_URL?.trim() || "https://brain-api.claracode.ai";
			const backend = process.env.CLARA_BACKEND_URL?.trim() || "https://api.claracode.ai";
			lines.push(await probeLabel(`${brain.replace(/\/$/, "")}/health`, "brain", "get"));
			lines.push(await probeLabel(`${backend.replace(/\/$/, "")}/health`, "backend", "get"));
			const tok = await context.secrets.get("clara.token");
			lines.push(
				tok
					? "ok  auth — token in SecretStorage"
					: "warn auth — no clara.token in SecretStorage (run `Clara: Login`)",
			);
			for (const line of lines) {
				ch.appendLine(line);
			}
			if (lines.some((l) => l.startsWith("err"))) {
				ch.appendLine(NETWORK_FAILURE_MESSAGE);
			} else {
				void vscode.window.showInformationMessage("Clara: Doctor — see output for probes.");
			}
		}),
	);
}

/** Map fetch failure for palette commands (prompt 18 / http-errors). */
export function showHttpError(status: number, body: string): void {
	void vscode.window.showErrorMessage(mapHttpErrorToString(status, body));
}
