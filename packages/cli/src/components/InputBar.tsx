import React from "react";
import { Box, Text } from "ink";

interface InputBarProps {
	value: string;
	isMicActive: boolean;
	isLoading: boolean;
	promptLabel: string;
}

export function InputBar({ value, isMicActive, isLoading, promptLabel }: InputBarProps) {
	const placeholder = isMicActive
		? "Listening... (press [m] to stop)"
		: isLoading
			? "Clara is thinking..."
			: promptLabel;

	return (
		<Box
			borderStyle="single"
			borderColor="#3B82F6"
			paddingX={2}
			alignItems="center"
			gap={1}
		>
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
					{placeholder}
				</Text>
			)}
		</Box>
	);
}
