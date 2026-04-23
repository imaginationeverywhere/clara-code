import { render } from "ink";
import React from "react";
import { VoiceConverseApp } from "./voice-converse-app.js";

/**
 * Default `clara` (no subcommand): greeting, then a push-to-turn loop using
 * `POST /voice/converse` via `postVoiceConverse`. Full coding TUI remains
 * `clara tui`.
 */
export function launchVoiceConverseMode(): void {
	render(React.createElement(VoiceConverseApp));
}
