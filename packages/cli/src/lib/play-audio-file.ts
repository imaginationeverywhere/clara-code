import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Plays a local audio file using a platform-appropriate command.
 */
export async function playAudioFile(filePath: string): Promise<void> {
	const platform = process.platform;
	if (platform === "darwin") {
		await execFileAsync("afplay", [filePath]);
		return;
	}
	if (platform === "win32") {
		await execFileAsync("cmd", ["/c", "start", "", filePath], { windowsHide: true });
		return;
	}
	try {
		await execFileAsync("ffplay", ["-nodisp", "-autoexit", "-loglevel", "quiet", filePath]);
	} catch {
		await execFileAsync("xdg-open", [filePath]);
	}
}
