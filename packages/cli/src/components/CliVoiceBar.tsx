import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";

/**
 * Ink/React waveform shown while the CLI mic is active.
 *
 * Same visual model as `packages/tui/src/components/voice-bar.ts` (`VoiceBar` class): amplitude
 * buckets mapped to block glyphs, listening vs processing animation. The imperative `VoiceBar` is
 * for the canvas-style `Tui` host (`demo-voice.ts`, etc.); this component is the Ink equivalent
 * for `clara tui` and cannot reuse the class without a React adapter.
 */
const BAR_COUNT = 16;

function generateWaveform(bars: number, state: "listening" | "processing"): number[] {
	if (state === "processing") {
		return Array.from({ length: bars }, (_, i) => Math.sin(i * 0.5) * 0.3 + 0.3);
	}
	return Array.from({ length: bars }, () => Math.random());
}

function ampToChar(amp: number): string {
	if (amp > 0.6) return "█";
	if (amp > 0.2) return "▄";
	return "░";
}

export interface CliVoiceBarProps {
	state: "listening" | "processing";
}

export function CliVoiceBar({ state }: CliVoiceBarProps) {
	const [waveform, setWaveform] = useState<number[]>(() => generateWaveform(BAR_COUNT, state));

	useEffect(() => {
		const interval = setInterval(() => {
			setWaveform(generateWaveform(BAR_COUNT, state));
		}, 100);
		return () => clearInterval(interval);
	}, [state]);

	const waveStr = waveform.map(ampToChar).join(" ");
	const stateLabel = state === "listening" ? "Listening..." : "Processing...";

	return (
		<Box paddingX={2} paddingY={0} justifyContent="center">
			<Text color="magenta">{`  ◉  ${waveStr}  ${stateLabel}`}</Text>
		</Box>
	);
}
