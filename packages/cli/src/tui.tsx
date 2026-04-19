// @ts-nocheck — Ink vs @types/react JSX component typing (ReactNode bigint) until Ink types align
import React, { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { Box, useApp, useInput } from "ink";
import { CliVoiceBar } from "./components/CliVoiceBar.js";
import { FirstRunPrompt } from "./components/FirstRunPrompt.js";
import { Header } from "./components/Header.js";
import { InputBar } from "./components/InputBar.js";
import { MessageFeed } from "./components/MessageFeed.js";
import { StatusBar } from "./components/StatusBar.js";
import { useVoice, type VoicePhase } from "./hooks/useVoice.js";
import { SIX_SIDE_PROJECTS_QUESTION } from "./lib/clara-code-surface-scripts.js";
import { patchClaraConfig, readClaraConfig } from "./lib/config-store.js";
import { readClaraCredentials, writeClaraCredentials } from "./lib/credentials-store.js";
import type { GatewayResult } from "./lib/gateway.js";
import { createSessionLogger, type SessionLogger } from "./lib/session-log.js";

export type AppProps = PropsWithChildren<{
	userId: string;
	gatewayUrl: string;
	backendUrl: string;
	version: string;
	voiceAudioEnabled: boolean;
	/** Pre-loaded token (if credentials existed at launch). Otherwise the first-run prompt shows. */
	initialToken: string | null;
	/** When true, CLI forwards `stubText` to `/api/voice/stt`; enabled by CLARA_VOICE_DEV_STUB. */
	devStubMode: boolean;
}>;

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

function phaseLabel(phase: VoicePhase): string {
	switch (phase) {
		case "listening":
			return "listening";
		case "transcribing":
			return "transcribing";
		case "sending":
			return "thinking";
		default:
			return "";
	}
}

export function App({
	userId,
	gatewayUrl,
	backendUrl,
	version,
	voiceAudioEnabled,
	initialToken,
	devStubMode,
}: AppProps) {
	const { exit } = useApp();
	const config = readClaraConfig();
	const isReturnSession = config.hasPriorSession === true;
	const lastProject = config.lastProject ?? null;
	const lastSessionDate = config.lastSessionDate ?? null;
	const sixAskedRef = useRef(config.sixSideProjectsAsked === true);
	const winCountRef = useRef(0);
	const lastProjectHint = useRef(config.lastProject ?? "Clara session");

	const [token, setToken] = useState<string | null>(initialToken);
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState("");
	const [latency, setLatency] = useState<number | null>(null);
	const [inputPlaceholder, setInputPlaceholder] = useState(
		isReturnSession ? "Continuing, or something new?" : "What are we building?",
	);
	const [pendingFix, setPendingFix] = useState(false);

	const loggerRef = useRef<SessionLogger | null>(null);
	if (token && !loggerRef.current) {
		loggerRef.current = createSessionLogger();
	}

	const saveSessionForExit = useCallback(() => {
		patchClaraConfig({
			hasPriorSession: true,
			lastSessionDate: new Date().toISOString(),
			lastProject: lastProjectHint.current,
			userId,
			gatewayUrl,
			backendUrl,
		});
	}, [backendUrl, gatewayUrl, userId]);

	const appendMessage = useCallback((m: Message) => {
		setMessages((prev) => [...prev, m]);
		loggerRef.current?.log(m.role, m.text);
	}, []);

	const onTranscript = useCallback(
		(result: { transcript: string; stub: boolean }) => {
			if (!result.transcript) return;
			const text = result.transcript;
			lastProjectHint.current = text.slice(0, 80);
			appendMessage({ id: nextId(), role: "user", text, ts: new Date() });
		},
		[appendMessage],
	);

	const onGatewayResult = useCallback(
		(result: GatewayResult, ms: number) => {
			setLatency(ms);
			if (!result.ok) {
				setPendingFix(true);
				setInputPlaceholder("y/n");
				appendMessage({ id: nextId(), role: "assistant", text: formatAssistantMessage(result), ts: new Date() });
				return;
			}
			setPendingFix(false);
			setInputPlaceholder("What's next?");
			winCountRef.current += 1;
			const winCount = winCountRef.current;
			appendMessage({ id: nextId(), role: "assistant", text: formatAssistantMessage(result), ts: new Date() });
			if (winCount === 1 && !sixAskedRef.current) {
				sixAskedRef.current = true;
				patchClaraConfig({ sixSideProjectsAsked: true });
				appendMessage({
					id: nextId(),
					role: "assistant",
					text: `> ${SIX_SIDE_PROJECTS_QUESTION}`,
					ts: new Date(),
				});
			}
		},
		[appendMessage],
	);

	const onError = useCallback(
		(err: string) => {
			setPendingFix(true);
			setInputPlaceholder("y/n");
			appendMessage({
				id: nextId(),
				role: "assistant",
				text: `Failed. ${err}\n\nFix: Check gateway and network.\n\nRunning fix now? (y/n)`,
				ts: new Date(),
			});
		},
		[appendMessage],
	);

	const { phase, isMicActive, isLoading, startListening, stopAndSend, cancel, sendText } = useVoice({
		gatewayUrl,
		backendUrl,
		token: token ?? "",
		userId,
		...(devStubMode ? { stubText: "" } : {}),
		onTranscript,
		onGatewayResult,
		onError,
	});

	const toggleMic = useCallback(() => {
		if (!token) return;
		if (phase === "idle") {
			startListening();
			return;
		}
		if (phase === "listening") {
			void stopAndSend();
			return;
		}
	}, [phase, startListening, stopAndSend, token]);

	const handleFirstRunSubmit = useCallback((pasted: string) => {
		writeClaraCredentials({ token: pasted });
		setToken(pasted);
	}, []);

	const handleFirstRunCancel = useCallback(() => {
		exit();
	}, [exit]);

	useInput((input, key) => {
		// First-run prompt owns input.
		if (!token) return;

		if (key.ctrl && input === "q") {
			saveSessionForExit();
			exit();
			return;
		}
		// Ctrl+Space (primary) — many terminals deliver this as input="\u0000". Ctrl+M kept as alias.
		if (key.ctrl && (input === " " || input === "\u0000" || input === "m")) {
			toggleMic();
			return;
		}
		if (key.escape) {
			if (phase !== "idle") {
				cancel();
				appendMessage({ id: nextId(), role: "system", text: "Cancelled.", ts: new Date() });
				return;
			}
		}

		if (pendingFix && !key.ctrl) {
			const ch = input.toLowerCase();
			if (ch === "y") {
				setPendingFix(false);
				setInputPlaceholder("What's next?");
				appendMessage({ id: nextId(), role: "system", text: "Running fix now.", ts: new Date() });
				void sendText("apply suggested fix");
				return;
			}
			if (ch === "n") {
				setPendingFix(false);
				setInputPlaceholder("What's next?");
				appendMessage({
					id: nextId(),
					role: "system",
					text: "Okay. Flagged. Continuing when you're ready.",
					ts: new Date(),
				});
				return;
			}
		}

		if (key.return) {
			if (inputText.trim()) {
				const text = inputText.trim();
				setInputText("");
				lastProjectHint.current = text.slice(0, 80);
				appendMessage({ id: nextId(), role: "user", text, ts: new Date() });
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

	useEffect(() => {
		return () => {
			cancel();
		};
	}, [cancel]);

	const showVoiceBar = useMemo(() => phase !== "idle", [phase]);

	if (!token) {
		return <FirstRunPrompt onSubmit={handleFirstRunSubmit} onCancel={handleFirstRunCancel} />;
	}

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
			{showVoiceBar && <CliVoiceBar state={phase === "listening" ? "listening" : "processing"} />}
			<MessageFeed messages={messages} />
			<InputBar
				value={inputText}
				isMicActive={isMicActive}
				isLoading={isLoading}
				placeholder={
					isMicActive
						? "Ctrl+Space to send — Esc to cancel"
						: isLoading
							? phaseLabel(phase)
							: inputPlaceholder
				}
			/>
		</Box>
	);
}
