import {
	cliFirstLaunchBlock,
	cliReturnSessionBlock,
	cliScripts,
	detectPartnerTypeFromFirstMessage,
	sixSideProjectsQuestion,
	type PartnerType,
} from "@clara/clara-code-surface-scripts";
import React, { useCallback, useRef, useState } from "react";
import { Box, useApp, useInput } from "ink";
import { Header } from "./components/Header.js";
import { InputBar } from "./components/InputBar.js";
import { MessageFeed } from "./components/MessageFeed.js";
import { StatusBar } from "./components/StatusBar.js";
import { CliVoiceBar } from "./components/CliVoiceBar.js";
import { useVoice } from "./hooks/useVoice.js";
import type { GatewayResult } from "./lib/gateway.js";
import { loadConfig, saveConfig } from "./lib/config.js";
import type { Message } from "./types.js";

export interface AppProps {
	version: string;
	userId: string;
	gatewayUrl: string;
	voiceOptIn: boolean;
}

let msgId = 0;

function nextId(): number {
	msgId += 1;
	return msgId;
}

export function App({ version, userId, gatewayUrl, voiceOptIn }: AppProps) {
	const { exit } = useApp();
	const cfg = loadConfig();
	const partnerRef = useRef<PartnerType>("unknown");
	const successCountRef = useRef(0);
	const sixAskedRef = useRef(cfg.sixSideProjectsAsked ?? false);
	const [sixAsked, setSixAsked] = useState(sixAskedRef.current);
	const [userExchangeCount, setUserExchangeCount] = useState(0);
	const [awaitingFixConfirm, setAwaitingFixConfirm] = useState(false);
	const [inputText, setInputText] = useState("");
	const [latency, setLatency] = useState<number | null>(null);
	const isReturnSession = Boolean(cfg.lastSessionDate || cfg.lastProject);
	const [promptLabel, setPromptLabel] = useState(
		isReturnSession ? "Continuing, or something new?" : "What are we building?",
	);

	const [messages, setMessages] = useState<Message[]>(() => {
		if (isReturnSession) {
			return [
				{
					id: nextId(),
					role: "system",
					text: cliReturnSessionBlock(
						userId,
						cfg.lastSessionDate ?? "—",
						cfg.lastProject ?? "—",
					),
					ts: new Date(),
				},
			];
		}
		return [
			{
				id: nextId(),
				role: "system",
				text: cliFirstLaunchBlock(version),
				ts: new Date(),
			},
		];
	});

	const getPartnerType = useCallback(() => partnerRef.current, []);
	const getSixSideProjectsAsked = useCallback(() => sixAskedRef.current, []);

	const onReply = useCallback((result: GatewayResult, ms: number) => {
		setLatency(ms);
		if (result.ok) {
			successCountRef.current += 1;
			const body = cliScripts.c3.successFooter(result.replyText);
			setMessages((prev) => [
				...prev,
				{ id: nextId(), role: "assistant", text: body, ts: new Date() },
			]);
			setPromptLabel("What's next?");
			if (
				successCountRef.current === 1 &&
				partnerRef.current === "developer" &&
				!sixAskedRef.current
			) {
				sixAskedRef.current = true;
				setSixAsked(true);
				saveConfig({ sixSideProjectsAsked: true });
				setMessages((prev) => [
					...prev,
					{
						id: nextId(),
						role: "assistant",
						text: `  > ${sixSideProjectsQuestion}`,
						ts: new Date(),
					},
				]);
			}
		} else {
			const err = result.plainError ?? "Unknown error";
			const fix = result.fix ?? "";
			setMessages((prev) => [
				...prev,
				{
					id: nextId(),
					role: "assistant",
					text: cliScripts.c4.failureBlock(err, fix),
					ts: new Date(),
				},
			]);
			setAwaitingFixConfirm(true);
			setPromptLabel("y/n");
		}
	}, []);

	const onError = useCallback((err: string) => {
		setMessages((prev) => [
			...prev,
			{ id: nextId(), role: "system", text: `Error: ${err}`, ts: new Date() },
		]);
	}, []);

	const { isMicActive, isLoading, toggleMic, sendText } = useVoice({
		gatewayUrl,
		userId,
		voiceOptIn,
		getPartnerType,
		getSixSideProjectsAsked,
		onReply,
		onError,
	});

	const submitLine = useCallback(async () => {
		const text = inputText.trim();
		if (!text) return;

		if (awaitingFixConfirm) {
			if (text === "y" || text === "n") {
				setAwaitingFixConfirm(false);
				if (text === "n") {
					setMessages((prev) => [
						...prev,
						{
							id: nextId(),
							role: "assistant",
							text: cliScripts.c4.deferFix,
							ts: new Date(),
						},
					]);
				} else {
					setMessages((prev) => [
						...prev,
						{
							id: nextId(),
							role: "system",
							text: "Running fix now…",
							ts: new Date(),
						},
					]);
				}
				setInputText("");
				setPromptLabel("What's next?");
				return;
			}
		}

		setInputText("");
		if (userExchangeCount === 0) {
			const p = detectPartnerTypeFromFirstMessage(text);
			partnerRef.current = p;
		}
		setUserExchangeCount((c) => c + 1);
		setMessages((prev) => [...prev, { id: nextId(), role: "user", text, ts: new Date() }]);
		await sendText(text);
	}, [inputText, awaitingFixConfirm, sendText, userExchangeCount]);

	useInput((input, key) => {
		if (input === "q" && key.ctrl) {
			saveConfig({
				lastSessionDate: new Date().toISOString().slice(0, 10),
				lastProject: cfg.lastProject ?? "session",
			});
			exit();
			return;
		}
		if (input === "m" && !key.ctrl && !key.meta) {
			toggleMic();
			return;
		}
		if (key.return) {
			void submitLine();
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
				lastProject={cfg.lastProject ?? null}
				lastSessionDate={cfg.lastSessionDate ?? null}
				userName={userId}
			/>
			<StatusBar
				isMicActive={isMicActive}
				isLoading={isLoading}
				model="Clara gateway"
				latency={latency}
				userId={userId}
				voiceOptIn={voiceOptIn}
			/>
			{isMicActive ? <CliVoiceBar state={isLoading ? "processing" : "listening"} /> : null}
			<MessageFeed messages={messages} />
			<InputBar
				value={inputText}
				isMicActive={isMicActive}
				isLoading={isLoading}
				promptLabel={promptLabel}
			/>
		</Box>
	);
}
