import { Box, Text } from "ink";

interface InputBarProps {
	value: string;
	isMicActive: boolean;
	isLoading: boolean;
	placeholder: string;
}

export function InputBar({ value, isMicActive, isLoading, placeholder }: InputBarProps) {
	const shown =
		isMicActive ? "Listening... (press [Ctrl+M] to stop)" : isLoading ? "Clara is thinking..." : placeholder;

	return (
		<Box borderStyle="single" borderColor="#3B82F6" paddingX={2} alignItems="center" gap={1}>
			<Text color="#3B82F6" bold>
				›
			</Text>
			{value ? (
				<Text color="#E2E8F0">
					{value}
					<Text color="#3B82F6">█</Text>
				</Text>
			) : (
				<Text color="#4B5563" dimColor>
					{shown}
				</Text>
			)}
		</Box>
	);
}
