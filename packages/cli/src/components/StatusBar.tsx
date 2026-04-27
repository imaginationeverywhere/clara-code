import { Box, Text } from "ink";

interface StatusBarProps {
	isMicActive: boolean;
	isLoading: boolean;
	model: string;
	latency: number | null;
	userId: string;
	voiceAudioEnabled: boolean;
	/** Shown as `N min` when the gateway returns `X-Clara-Minutes-Remaining` (never "Unlimited"). */
	minutesRemaining: number | null;
}

export function StatusBar({
	isMicActive,
	isLoading,
	model,
	latency,
	userId,
	voiceAudioEnabled,
	minutesRemaining,
}: StatusBarProps) {
	const micStatus = isMicActive ? "● LIVE" : isLoading ? "◌ Thinking..." : "○ Ready";

	const micColor = isMicActive ? "red" : isLoading ? "yellow" : "green";

	const min = minutesRemaining;
	const minLabel = min != null ? ` · ${min} min` : "";
	const centerColor =
		min == null ? "gray" : min === 0 ? "red" : min < 20 ? "yellow" : "gray";

	return (
		<Box borderStyle="single" borderColor="#374151" paddingX={2} justifyContent="space-between">
			<Text color={micColor} bold>
				{micStatus}
			</Text>
			<Text color={centerColor}>
				{model}
				{minLabel}
				{latency !== null ? ` · ${latency}ms` : ""}
				{voiceAudioEnabled ? " · audio" : " · text"}
			</Text>
			<Text color="#6B7280">
				user: {userId} · [Ctrl+M] mic · [Enter] send · [Ctrl+Q] quit
			</Text>
		</Box>
	);
}
