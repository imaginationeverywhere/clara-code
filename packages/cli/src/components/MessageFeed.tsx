// @ts-nocheck — Ink vs @types/react JSX component typing (ReactNode bigint) until Ink types align
import React from "react";
import { Box, Static, Text } from "ink";
import type { Message } from "../tui.js";

interface MessageFeedProps {
	messages: Message[];
}

const roleColor: Record<Message["role"], string> = {
	user: "#3B82F6",
	assistant: "#7C3AED",
	system: "#6B7280",
};

const roleLabel: Record<Message["role"], string> = {
	user: "  You",
	assistant: "Clara",
	system: "  sys",
};

export function MessageFeed({ messages }: MessageFeedProps) {
	return (
		<Box flexDirection="column" flexGrow={1} paddingX={1} overflowY="hidden">
			<Static items={messages}>
				{(msg) => (
					<Box key={msg.id} marginBottom={1} flexDirection="column">
						<Box gap={1}>
							<Text color={roleColor[msg.role]} bold>
								{roleLabel[msg.role]}
							</Text>
							<Text color="#9CA3AF" dimColor>
								{msg.ts.toLocaleTimeString("en-US", { hour12: false })}
							</Text>
						</Box>
						<Box paddingLeft={6}>
							<Text
								color={msg.role === "system" ? "#6B7280" : "#E2E8F0"}
								dimColor={msg.role === "system"}
							>
								{msg.text}
							</Text>
						</Box>
					</Box>
				)}
			</Static>
		</Box>
	);
}
