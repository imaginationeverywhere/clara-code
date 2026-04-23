import { useState } from "react";
import { Box, Text, useInput } from "ink";

export type FirstRunPromptProps = {
	onSubmit: (token: string) => void;
	onCancel: () => void;
};

/**
 * Zero-config first-run gate: shown when `~/.clara/credentials.json` is missing. The user pastes
 * a token (sk-clara-… or cc_live_…) obtained from https://claracode.ai and we hand it off to the
 * caller for persistence.
 */
export function FirstRunPrompt({ onSubmit, onCancel }: FirstRunPromptProps) {
	const [value, setValue] = useState("");

	useInput((input, key) => {
		if (key.escape || (key.ctrl && input === "c")) {
			onCancel();
			return;
		}
		if (key.return) {
			const trimmed = value.trim();
			if (trimmed.length > 0) onSubmit(trimmed);
			return;
		}
		if (key.backspace || key.delete) {
			setValue((v) => v.slice(0, -1));
			return;
		}
		if (input && !key.ctrl && !key.meta) {
			setValue((v) => v + input);
		}
	});

	const masked = value.length === 0 ? "" : "*".repeat(Math.min(value.length, 48));

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyan">Welcome to Clara Code.</Text>
			<Text>{" "}</Text>
			<Text>You'll need a CLI token to continue. Visit:</Text>
			<Text color="magenta">  https://claracode.ai</Text>
			<Text>to create one (Account → API keys).</Text>
			<Text>{" "}</Text>
			<Text>Paste your token (sk-clara-… or cc_live_…) and press Enter.</Text>
			<Text>Press Esc to quit.</Text>
			<Text>{" "}</Text>
			<Text color="green">&gt; {masked}</Text>
		</Box>
	);
}
