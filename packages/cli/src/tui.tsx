// @ts-nocheck — Ink vs @types/react JSX component typing (ReactNode bigint) until Ink types align
import React, { useCallback, useRef, useState } from "react";
import { Box, useApp, useInput } from "ink";
import { Header } from "./components/Header.js";
import { InputBar } from "./components/InputBar.js";
import { MessageFeed } from "./components/MessageFeed.js";
import { StatusBar } from "./components/StatusBar.js";
import { CliVoiceBar } from "./components/CliVoiceBar.js";
import { useVoice } from "./hooks/useVoice.js";
import { SIX_SIDE_PROJECTS_QUESTION } from "./lib/clara-code-surface-scripts.js";
import { patchClaraConfig, readClaraConfig } from "./lib/config-store.js";
import type { GatewayResult } from "./lib/gateway.js";

export interface AppProps {
	userId: string;
	gatewayUrl: string;
	version: string;
	voiceAudioEnabled: boolean;
}

export interface Message {
	id: number;
	role: "user" | "assistant" | "system";
	text: string;
	ts: Date;
}

let msgId = 0;

function nextId(): number {
	msgId += 1;
	return msgId;
}

function formatAssistantMessage(result: GatewayResult): string {
	if (!result.ok) {
		const fix = result.fixHint ?? "Retry or adjust the request.";
		return `Failed. ${result.reply}\n\nFix: ${fix}\n\nRunning fix now? (y/n)`;
	}
	const line = result.reply.trim();
	const done = line.startsWith("Done.") ? line : `Done. ${line}`;
	return `${done}\n\nWhat's next?`;
}

export function App({ userId, gatewayUrl, version, voiceAudioEnabled }: AppProps) {
	const { exit } = useApp();
	const config = readClaraConfig();
	const isReturnSession = config.hasPriorSession === true;
	const lastProject = config.lastProject ?? null;
	const lastSessionDate = config.lastSessionDate ?? null;
	const sixAskedRef = useRef(config.sixSideProjectsAsked === true);
	const winCountRef = useRef(0);
	const lastProjectHint = useRef(config.lastProject ?? "Clara session");

	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState("");
	const [latency, setLatency] = useState<number | null>(null);
	const [inputPlaceholder, setInputPlaceholder] = useState(
		isReturnSession ? "Continuing, or something new?" : "What are we building?",
	);
	const [pendingFix, setPendingFix] = useState(false);

	const saveSessionForExit = useCallback(() => {
		patchClaraConfig({
			hasPriorSession: true,
			lastSessionDate: new Date().toISOString(),
			lastProject: lastProjectHint.current,
			userId,
			gatewayUrl,
		});
	}, [gatewayUrl, userId]);

	const onGatewayResult = useCallback(
		(result: GatewayResult, ms: number) => {
			setLatency(ms);
			if (!result.ok) {
				setPendingFix(true);
				setInputPlaceholder("y/n");
				setMessages((prev) => [
					...prev,
					{ id: nextId(), role: "assistant", text: formatAssistantMessage(result), ts: new Date() },
				]);
				return;
			}
			setPendingFix(false);
			setInputPlaceholder("What's next?");
			winCountRef.current += 1;
			const winCount = winCountRef.current;
			setMessages((prev) => {
				const next: Message[] = [
					...prev,
					{ id: nextId(), role: "assistant", text: formatAssistantMessage(result), ts: new Date() },
				];
				if (winCount === 1 && !sixAskedRef.current) {
					sixAskedRef.current = true;
					patchClaraConfig({ sixSideProjectsAsked: true });
					next.push({
						id: nextId(),
						role: "assistant",
						text: `> ${SIX_SIDE_PROJECTS_QUESTION}`,
						ts: new Date(),
					});
				}
				return next;
			});
		},
		[],
	);

	const onError = useCallback((err: string) => {
		setPendingFix(true);
		setInputPlaceholder("y/n");
		setMessages((prev) => [
			...prev,
			{
				id: nextId(),
				role: "assistant",
				text: `Failed. ${err}\n\nFix: Check gateway and network.\n\nRunning fix now? (y/n)`,
				ts: new Date(),
			},
		]);
	}, []);

	const { isMicActive, isLoading, toggleMic, sendText } = useVoice({
		gatewayUrl,
		userId,
		onGatewayResult,
		onError,
	});

	useInput((input, key) => {
		if (key.ctrl && input === "q") {
			saveSessionForExit();
			exit();
			return;
		}
		if (key.ctrl && input === "m") {
			toggleMic();
			return;
		}

		if (pendingFix && !key.ctrl) {
			const ch = input.toLowerCase();
			if (ch === "y") {
				setPendingFix(false);
				setInputPlaceholder("What's next?");
				setMessages((prev) => [
					...prev,
					{ id: nextId(), role: "system", text: "Running fix now.", ts: new Date() },
				]);
				void sendText("apply suggested fix");
				return;
			}
			if (ch === "n") {
				setPendingFix(false);
				setInputPlaceholder("What's next?");
				setMessages((prev) => [
					...prev,
					{ id: nextId(), role: "system", text: "Okay. Flagged. Continuing when you're ready.", ts: new Date() },
				]);
				return;
			}
		}

		if (key.return) {
			if (inputText.trim()) {
				const text = inputText.trim();
				setInputText("");
				lastProjectHint.current = text.slice(0, 80);
				setMessages((prev) => [...prev, { id: nextId(), role: "user", text, ts: new Date() }]);
				void sendText(text);
			}
			return;
		}
		if (key.backspace || key.delete) {
			setInputText((prev) => prev.slice(0, -1));
			return;
		}
		if (input && !key.ctrl && !key.meta) {
			setInputText((prev) => prev + input);
		}
	});

	return (
		<Box flexDirection="column" height="100%">
			<Header
				version={version}
				isReturnSession={isReturnSession}
				lastProject={lastProject}
				userName={userId}
				lastSessionDate={lastSessionDate}
			/>
			<StatusBar
				isMicActive={isMicActive}
				isLoading={isLoading}
				model="Clara"
				latency={latency}
				userId={userId}
				voiceAudioEnabled={voiceAudioEnabled}
			/>
			{isMicActive && <VoiceWave />}
			<MessageFeed messages={messages} />
			<InputBar
				value={inputText}
				isMicActive={isMicActive}
				isLoading={isLoading}
				placeholder={inputPlaceholder}
			/>
		</Box>
	);
}
