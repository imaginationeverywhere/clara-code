import type { Component } from "../tui.js";

export interface VoiceBarTheme {
	barChar?: string;
	barCharLow?: string;
	barCharSilent?: string;
	activeColor?: string;
	mutedColor?: string;
	reset?: string;
}

export type VoiceState = "idle" | "listening" | "processing";

const DEFAULT_THEME: Required<VoiceBarTheme> = {
	barChar: "█",
	barCharLow: "▄",
	barCharSilent: "░",
	activeColor: "\x1b[35m",
	mutedColor: "\x1b[2m",
	reset: "\x1b[0m",
};

function generateWaveform(bars: number, state: VoiceState): number[] {
	if (state === "idle") return new Array(bars).fill(0);
	if (state === "processing") {
		return Array.from({ length: bars }, (_, i) => Math.sin(i * 0.5) * 0.3 + 0.3);
	}
	return Array.from({ length: bars }, () => Math.random());
}

export class VoiceBar implements Component {
	private state: VoiceState = "idle";
	private theme: Required<VoiceBarTheme>;
	private _waveform: number[] = [];

	constructor(theme: VoiceBarTheme = {}) {
		this.theme = { ...DEFAULT_THEME, ...theme };
	}

	setState(state: VoiceState): void {
		this.state = state;
	}

	getState(): VoiceState {
		return this.state;
	}

	tick(): boolean {
		if (this.state === "idle") return false;
		this._waveform = generateWaveform(16, this.state);
		return true;
	}

	render(width: number): string[] {
		const { barChar, barCharLow, barCharSilent, activeColor, mutedColor, reset } = this.theme;

		if (this.state === "idle") {
			const label = `${mutedColor}  ◉  Ctrl+Space to speak${reset}`;
			return [label];
		}

		const barCount = Math.min(16, Math.floor(width / 3));
		const waveform =
			this._waveform.length >= barCount ? this._waveform.slice(0, barCount) : generateWaveform(barCount, this.state);

		const waveStr = waveform
			.map((amp) => {
				if (amp > 0.6) return barChar;
				if (amp > 0.2) return barCharLow;
				return barCharSilent;
			})
			.join(" ");

		const stateLabel = this.state === "listening" ? "Listening..." : "Processing...";

		const line = `${activeColor}  ◉  ${waveStr}  ${stateLabel}${reset}`;
		return [line];
	}

	invalidate(): void {
		this._waveform = [];
	}
}
