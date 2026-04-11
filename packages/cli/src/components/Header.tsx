import React from "react";
import { Box, Text } from "ink";

interface HeaderProps {
	version: string;
	isReturnSession: boolean;
	lastProject?: string | null;
	lastSessionDate?: string | null;
	userName?: string | null;
}

export function Header({
	version,
	isReturnSession,
	lastProject,
	lastSessionDate,
	userName,
}: HeaderProps) {
	if (isReturnSession) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text color="#3B82F6" bold>
					Clara Code{userName ? ` — ${userName}` : ""}
				</Text>
				<Text> </Text>
				{lastSessionDate && lastProject ? (
					<Text color="#6B7280" dimColor>
						Last session: {lastSessionDate}, {lastProject}
					</Text>
				) : null}
				<Text> </Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingX={2} paddingY={1}>
			<Text color="#3B82F6" bold>
				Clara Code v{version}
			</Text>
			<Text> </Text>
			<Text color="#E2E8F0">{"  I've never written a line of code."}</Text>
			<Text color="#E2E8F0">{"  Whether you've done it before or not."}</Text>
			<Text> </Text>
			<Text color="#9CA3AF">{"  We speak things into existence around here."}</Text>
			<Text> </Text>
		</Box>
	);
}
