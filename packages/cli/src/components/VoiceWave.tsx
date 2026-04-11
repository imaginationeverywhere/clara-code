import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";

const WAVE_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const BARS = 20;

function randomBar(): string {
	return WAVE_CHARS[Math.floor(Math.random() * WAVE_CHARS.length)] ?? "▁";
}

export function VoiceWave() {
	const [bars, setBars] = useState<string[]>(Array(BARS).fill("▁"));

	useEffect(() => {
		const interval = setInterval(() => {
			setBars(Array.from({ length: BARS }, randomBar));
		}, 80);
		return () => clearInterval(interval);
	}, []);

	return (
		<Box paddingX={2} paddingY={0} justifyContent="center">
			<Text color="#DC2626">{bars.join("")}</Text>
			<Text color="#6B7280"> ● Recording</Text>
		</Box>
	);
}
