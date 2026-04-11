// @ts-nocheck — Ink vs @types/react JSX component typing (ReactNode bigint) until Ink types align
import React from "react";
import { Box, Text } from "ink";

interface StatusBarProps {
	isMicActive: boolean;
	isLoading: boolean;
	model: string;
	latency: number | null;
	userId: string;
	voiceAudioEnabled: boolean;
}

export function StatusBar({
	isMicActive,
	isLoading,
	model,
	latency,
	userId,
	voiceAudioEnabled,
}: StatusBarProps) {
	const micStatus = isMicActive ? "● LIVE" : isLoading ? "◌ Thinking..." : "○ Ready";

	const micColor = isMicActive ? "red" : isLoading ? "yellow" : "green";

	return (
		<Box borderStyle="single" borderColor="#374151" paddingX={2} justifyContent="space-between">
			<Text color={micColor} bold>
				{micStatus}
			</Text>
			<Text color="#6B7280">
				{model}
				{latency !== null ? ` · ${latency}ms` : ""}
				{voiceAudioEnabled ? " · audio" : " · text"}
			</Text>
			<Text color="#6B7280">
				user: {userId} · [Ctrl+M] mic · [Enter] send · [Ctrl+Q] quit
			</Text>
		</Box>
	);
}
