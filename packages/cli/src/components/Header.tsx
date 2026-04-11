// @ts-nocheck — Ink vs @types/react JSX component typing (ReactNode bigint) until Ink types align
import React from "react";
import { Box, Text } from "ink";
import { SURFACE_C1_LINES } from "../lib/clara-code-surface-scripts.js";

interface HeaderProps {
	version: string;
	isReturnSession: boolean;
	lastProject?: string | null;
	userName?: string | null;
	lastSessionDate?: string | null;
}

function formatSessionDate(iso: string | null | undefined): string {
	if (!iso) return "";
	try {
		return new Date(iso).toLocaleString(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		});
	} catch {
		return iso;
	}
}

export function Header({ version, isReturnSession, lastProject, userName, lastSessionDate }: HeaderProps) {
	if (isReturnSession) {
		const datePart = formatSessionDate(lastSessionDate ?? undefined);
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text color="#3B82F6" bold>
					Clara Code{userName ? ` — ${userName}` : ""}
				</Text>
				<Text> </Text>
				<Text color="#6B7280" dimColor>
					Last session: {datePart}
					{lastProject ? `, ${lastProject}` : ""}
				</Text>
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
			<Text color="#E2E8F0">{`  ${SURFACE_C1_LINES[0]}`}</Text>
			<Text color="#E2E8F0">{`  ${SURFACE_C1_LINES[1]}`}</Text>
			<Text> </Text>
			<Text color="#9CA3AF">{`  ${SURFACE_C1_LINES[2]}`}</Text>
			<Text> </Text>
		</Box>
	);
}
