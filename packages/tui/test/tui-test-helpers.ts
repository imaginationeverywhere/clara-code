import type { TUI } from "../src/tui.js";
import type { VirtualTerminal } from "./virtual-terminal.js";

/**
 * Wait until the TUI has completed its first paint. `tui.start()` schedules a debounced
 * render (`setTimeout`); `terminal.flush()` alone can resolve before `doRender()` runs.
 */
export async function waitForTuiPaint(tui: TUI, terminal: VirtualTerminal): Promise<void> {
	const deadline = Date.now() + 5000;
	while (tui.fullRedraws === 0 && Date.now() < deadline) {
		await new Promise<void>((resolve) => setImmediate(resolve));
	}
	await terminal.flush();
}

/**
 * Wait for a render triggered by `requestRender()` to finish (debounce + differential path).
 */
export async function settleTui(_tui: TUI, terminal: VirtualTerminal): Promise<void> {
	await terminal.flush();
	await new Promise<void>((resolve) => setTimeout(resolve, 40));
	await terminal.flush();
}
