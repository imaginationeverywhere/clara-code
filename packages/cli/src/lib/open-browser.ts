import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Opens `url` in the user's default browser (best-effort per platform).
 */
export async function openBrowser(url: string): Promise<void> {
	const platform = process.platform;
	if (platform === "darwin") {
		await execFileAsync("open", [url]);
		return;
	}
	if (platform === "win32") {
		await execFileAsync("cmd", ["/c", "start", "", url], { windowsHide: true });
		return;
	}
	await execFileAsync("xdg-open", [url]);
}
