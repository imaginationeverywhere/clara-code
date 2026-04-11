/// <reference path="./speech-globals.d.ts" />
import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const vscode = acquireVsCodeApi();

interface Message {
	role: "user" | "assistant";
	text: string;
	ts: number;
}

interface InitPayload {
	surface: "ide" | "panel";
	initialMessages: Array<{ role: "assistant"; text: string }>;
	userName: string;
	sixSideProjectsAsked: boolean;
}

export function VoiceBar(): ReactElement {
	const [isMicActive, setIsMicActive] = useState(false);
	const isMicActiveRef = useRef(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [liveTranscript, setLiveTranscript] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [readySent, setReadySent] = useState(false);
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		isMicActiveRef.current = isMicActive;
	}, [isMicActive]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (!readySent) {
			vscode.postMessage({ type: "ready" });
			setReadySent(true);
		}
	}, [readySent]);

	const sendMessage = useCallback((text: string) => {
		if (!text.trim()) return;
		setMessages((prev) => [...prev, { role: "user", text, ts: Date.now() }]);
		setIsLoading(true);
		vscode.postMessage({ type: "voice-input", text });
	}, []);

	const stopListening = useCallback(() => {
		recognitionRef.current?.stop();
		recognitionRef.current = null;
		setIsMicActive(false);
		setLiveTranscript("");
	}, []);

	const startListening = useCallback(() => {
		const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
		if (!SR) return;

		const rec = new SR();
		rec.continuous = true;
		rec.interimResults = true;
		rec.lang = "en-US";

		rec.onresult = (e: SpeechRecognitionEvent) => {
			let interim = "";
			let final = "";
			for (let i = e.resultIndex; i < e.results.length; i++) {
				if (e.results[i].isFinal) {
					final += e.results[i][0].transcript;
				} else {
					interim += e.results[i][0].transcript;
				}
			}
			if (final) {
				sendMessage(final.trim());
				setLiveTranscript("");
			} else {
				setLiveTranscript(interim);
			}
		};

		rec.onerror = () => {
			setIsMicActive(false);
			setLiveTranscript("");
		};

		rec.onend = () => {
			setIsMicActive(false);
			setLiveTranscript("");
		};

		rec.start();
		recognitionRef.current = rec;
		setIsMicActive(true);
	}, [sendMessage]);

	useEffect(() => {
		const handler = (event: MessageEvent<{ type: string; payload?: unknown }>) => {
			const { type, payload } = event.data;
			switch (type) {
				case "init": {
					const p = payload as InitPayload;
					setMessages(
						p.initialMessages.map((m) => ({
							role: "assistant",
							text: m.text,
							ts: Date.now(),
						})),
					);
					break;
				}
				case "toggle-mic":
					if (isMicActiveRef.current) {
						stopListening();
					} else {
						startListening();
					}
					break;
				case "voice-reply": {
					const p = payload as { text: string };
					setIsLoading(false);
					setMessages((prev) => [
						...prev,
						{ role: "assistant", text: p.text, ts: Date.now() },
					]);
					break;
				}
				case "voice-error": {
					const p = payload as { message: string };
					setIsLoading(false);
					setMessages((prev) => [
						...prev,
						{ role: "assistant", text: `Error: ${p.message}`, ts: Date.now() },
					]);
					break;
				}
				case "explain-code": {
					const p = payload as { code: string; language: string };
					const msg = `Explain this ${p.language} code:\n\`\`\`${p.language}\n${p.code}\n\`\`\``;
					sendMessage(msg);
					break;
				}
				default:
					break;
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [sendMessage, startListening, stopListening]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Enter" && isMicActiveRef.current) {
				e.preventDefault();
				stopListening();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [stopListening]);

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<span style={styles.logo}>Clara</span>
				<span style={styles.statusDot(isMicActive)} />
			</div>

			<div style={styles.messages}>
				{messages.length === 0 && (
					<div style={styles.empty}>
						Press the mic or <kbd style={styles.kbd}>Ctrl+Shift+Space</kbd> to speak
					</div>
				)}
				{messages.map((m) => (
					<div key={m.ts} style={styles.message(m.role)}>
						<div style={styles.role}>{m.role === "user" ? "You" : "Clara"}</div>
						<div style={styles.text}>{m.text}</div>
					</div>
				))}
				{isLoading && (
					<div style={styles.message("assistant")}>
						<div style={styles.role}>Clara</div>
						<div style={styles.typing}>
							<span />
							<span />
							<span />
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{liveTranscript ? <div style={styles.transcript}>{liveTranscript}</div> : null}

			<div style={styles.controls}>
				<button
					type="button"
					onClick={isMicActive ? stopListening : startListening}
					style={styles.micBtn(isMicActive)}
					aria-label={isMicActive ? "Stop listening" : "Start listening"}
				>
					{isMicActive ? (
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
							<title>Stop</title>
							<rect x="6" y="6" width="12" height="12" rx="2" />
						</svg>
					) : (
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
							<title>Mic</title>
							<path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
							<path
								d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"
								strokeWidth="2"
								stroke="currentColor"
								fill="none"
							/>
						</svg>
					)}
				</button>
				{isMicActive ? <span style={styles.hint}>Enter to stop</span> : null}
			</div>
		</div>
	);
}

const BLUE = "#3B82F6";
const DARK = "#0d0d1a";
const SURFACE = "#1a1a2e";

const styles = {
	container: {
		display: "flex" as const,
		flexDirection: "column" as const,
		height: "100vh",
		background: DARK,
		color: "#e2e8f0",
		fontFamily: "'Inter', var(--vscode-font-family), sans-serif",
		fontSize: "13px",
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "12px 16px 8px",
		borderBottom: "1px solid #ffffff10",
	},
	logo: {
		fontWeight: 700,
		color: BLUE,
		letterSpacing: "0.05em",
		fontSize: "14px",
	},
	statusDot: (active: boolean) => ({
		width: 8,
		height: 8,
		borderRadius: "50%",
		background: active ? "#10B981" : "#374151",
		transition: "background 0.2s",
	}),
	messages: {
		flex: 1,
		overflowY: "auto" as const,
		padding: "12px",
		display: "flex",
		flexDirection: "column" as const,
		gap: "8px",
	},
	empty: {
		color: "#6B7280",
		textAlign: "center" as const,
		marginTop: "40%",
		lineHeight: 1.6,
	},
	message: (role: "user" | "assistant") => ({
		background: role === "user" ? "#1e3a5f" : SURFACE,
		borderRadius: "8px",
		padding: "8px 12px",
		borderLeft: `3px solid ${role === "user" ? BLUE : "#7C3AED"}`,
	}),
	role: {
		fontSize: "11px",
		fontWeight: 600,
		color: "#9CA3AF",
		marginBottom: "4px",
		textTransform: "uppercase" as const,
		letterSpacing: "0.05em",
	},
	text: {
		lineHeight: 1.5,
		whiteSpace: "pre-wrap" as const,
	},
	typing: {
		display: "flex",
		gap: "4px",
		alignItems: "center",
	},
	transcript: {
		padding: "6px 16px",
		color: "#9CA3AF",
		fontStyle: "italic" as const,
		fontSize: "12px",
		background: "#ffffff06",
	},
	controls: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "10px",
		padding: "12px",
		borderTop: "1px solid #ffffff10",
	},
	micBtn: (active: boolean) => ({
		width: 44,
		height: 44,
		borderRadius: "50%",
		background: active ? "#DC2626" : BLUE,
		border: "none",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#fff",
		transition: "background 0.2s, transform 0.1s",
		transform: active ? "scale(1.05)" : "scale(1)",
		boxShadow: active ? "0 0 12px #DC262688" : "none",
	}),
	hint: {
		fontSize: "11px",
		color: "#6B7280",
	},
	kbd: {
		background: "#1e293b",
		border: "1px solid #374151",
		borderRadius: "3px",
		padding: "1px 5px",
		fontSize: "11px",
		fontFamily: "monospace",
	},
};
