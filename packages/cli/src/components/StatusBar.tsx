import React from "react";
import { Box, Text } from "ink";

interface StatusBarProps {
	isMicActive: boolean;
	isLoading: boolean;
	model: string;
	latency: number | null;
	userId: string;
	voiceOptIn: boolean;
}

export function StatusBar({
	isMicActive,
	isLoading,
	model,
	latency,
	userId,
	voiceOptIn,
}: StatusBarProps) {
	const micStatus = isMicActive ? "● LIVE" : isLoading ? "◌ Thinking..." : "○ Ready";
	const micColor = isMicActive ? "red" : isLoading ? "yellow" : "green";

	return (
		<Box
			borderStyle="single"
			borderColor="#374151"
			paddingX={2}
			justifyContent="space-between"
		>
			<Text color={micColor} bold>
				{micStatus}
			</Text>
			<Text color="#6B7280">
				{model}
				{latency !== null ? ` · ${latency}ms` : ""}
				{voiceOptIn ? " · voice on" : ""}
			</Text>
			<Text color="#6B7280">
				user: {userId} · [m] mic · [Enter] send · [Ctrl+Q] quit
			</Text>
		</Box>
	);
}
