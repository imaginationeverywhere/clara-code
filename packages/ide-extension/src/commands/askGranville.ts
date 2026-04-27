import * as vscode from "vscode";
import { DEFAULT_GATEWAY_URL, GATEWAY_SECRET_KEY } from "../constants";
import { mapHttpErrorToString, NETWORK_FAILURE_MESSAGE } from "../http-errors";

export function registerAskGranville(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("clara.askGranville", async () => {
			const panel = vscode.window.createWebviewPanel(
				"claraAskGranville",
				"Clara: Ask Granville",
				vscode.ViewColumn.Beside,
				{ enableScripts: true },
			);
			const gateway = (await context.secrets.get(GATEWAY_SECRET_KEY))?.trim() || DEFAULT_GATEWAY_URL;
			const base = gateway.replace(/\/$/, "");
			const url = `${base}/v1/ask-granville`;
			panel.webview.html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);padding:12px;}textarea{width:100%;min-height:80px;}#out{white-space:pre-wrap;margin-top:8px;}</style></head>
<body>
<h2>Granville T. Woods</h2>
<p>Architect. Send routes through the gateway.</p>
<textarea id="q" placeholder="Your question…"></textarea><br/>
<button id="go">Send</button>
<div id="out"></div>
<script>
const vscode = acquireVsCodeApi();
window.addEventListener('message', (e) => { const o = document.getElementById('out'); if (o && e.data && e.data.type === 'out') o.textContent = e.data.text; });
document.getElementById('go').onclick = () => {
  const t = (document.getElementById('q')||{}).value || '';
  vscode.postMessage({ type: 'ask', text: t });
};
</script>
</body></html>`;
			panel.webview.onDidReceiveMessage(async (msg: { type?: string; text?: string }) => {
				if (msg.type !== "ask" || typeof msg.text !== "string") {
					return;
				}
				const token = await context.secrets.get("clara.token");
				if (!token) {
					void panel.webview.postMessage({ type: "out", text: "Sign in with `Clara: Login` first." });
					return;
				}
				try {
					const r = await fetch(url, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({ surface: "ide", message: msg.text }),
					});
					const text = await r.text();
					if (!r.ok) {
						void panel.webview.postMessage({ type: "out", text: mapHttpErrorToString(r.status, text) });
						return;
					}
					void panel.webview.postMessage({ type: "out", text });
				} catch (e) {
					void panel.webview.postMessage({
						type: "out",
						text: e instanceof Error ? e.message : NETWORK_FAILURE_MESSAGE,
					});
				}
			});
		}),
	);
}
