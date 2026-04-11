/**
 * Bottom chrome VoiceBar for Clara Code IDE webviews (prompt 15-qcs1-voicebar-ide-chrome).
 * Inline styles only — no Tailwind in this package.
 */
import type { CSSProperties, FormEvent, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const WAVEFORM_HEIGHTS = [8, 12, 24, 16, 8, 28, 20, 12, 16, 24, 12, 8];

export interface VoiceBarProps {
	onSubmit: (text: string, source: "voice" | "text") => void;
	shortcutLabel?: string;
}

function MicIcon({ color }: { color: string }): ReactElement {
	return (
		<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ color }}>
			<title>mic</title>
			<path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
			<path
				d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"
				stroke="currentColor"
				strokeWidth="2"
				fill="none"
			/>
		</svg>
	);
}

function KeyboardIcon(): ReactElement {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
			<title>keyboard</title>
			<path d="M4 6h16v12H4V6zm2 2v2h2V8H6zm3 0v2h2V8H9zm3 0v2h2V8h-2zm3 0v2h2V8h-2zm3 0v2h2V8h-2zM6 11v2h12v-2H6zm0 3v2h8v-2H6z" />
		</svg>
	);
}

function ArrowRightIcon(): ReactElement {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
			<title>send</title>
			<path d="M5 12h14M14 7l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

const shell: CSSProperties = {
	display: "flex",
	height: 80,
	flexShrink: 0,
	alignItems: "center",
	gap: 16,
	borderTop: "1px solid rgba(255,255,255,0.06)",
	background: "#0F1318",
	paddingLeft: 24,
	paddingRight: 24,
};

export function VoiceBar({ onSubmit, shortcutLabel = "Ctrl+Space" }: VoiceBarProps): ReactElement {
	const [isVoiceMode, setIsVoiceMode] = useState(true);
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [inputText, setInputText] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const stopMockListen = useCallback(() => {
		if (listenTimerRef.current) {
			clearTimeout(listenTimerRef.current);
			listenTimerRef.current = null;
		}
	}, []);

	const toggleListening = useCallback(() => {
		setIsListening((was) => {
			if (was) {
				stopMockListen();
				return false;
			}
			setTranscript("");
			listenTimerRef.current = setTimeout(() => {
				const mockText = "Create a function to handle user authentication";
				setTranscript(mockText);
				setIsListening(false);
				onSubmit(mockText, "voice");
			}, 3000);
			return true;
		});
	}, [onSubmit, stopMockListen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.code === "Space") {
				e.preventDefault();
				if (isVoiceMode) {
					toggleListening();
				} else {
					setIsVoiceMode(true);
				}
			}
			if (!isVoiceMode && e.key === "Escape") {
				setIsVoiceMode(true);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isVoiceMode, toggleListening]);

	useEffect(() => {
		if (!isVoiceMode && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isVoiceMode]);

	useEffect(() => {
		return () => stopMockListen();
	}, [stopMockListen]);

	const handleTextSubmit = (e: FormEvent) => {
		e.preventDefault();
		const text = inputText.trim();
		if (!text) return;
		onSubmit(text, "text");
		setInputText("");
	};

	if (!isVoiceMode) {
		return (
			<div style={shell}>
				<button
					type="button"
					onClick={() => setIsVoiceMode(true)}
					style={{
						display: "flex",
						height: 32,
						width: 32,
						flexShrink: 0,
						alignItems: "center",
						justifyContent: "center",
						borderRadius: "50%",
						border: "1px solid rgba(255,255,255,0.1)",
						background: "rgba(255,255,255,0.05)",
						color: "rgba(255,255,255,0.4)",
						cursor: "pointer",
					}}
					title="Switch to voice"
				>
					<MicIcon color="#a78bfa" />
				</button>
				<form onSubmit={handleTextSubmit} style={{ display: "flex", flex: 1, alignItems: "center", gap: 8 }}>
					<input
						ref={inputRef}
						type="text"
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder="Type a message... (Esc for voice)"
						style={{
							flex: 1,
							borderRadius: 12,
							border: "1px solid rgba(255,255,255,0.1)",
							background: "#070A0F",
							padding: "10px 16px",
							fontFamily: "ui-monospace, monospace",
							fontSize: 14,
							color: "#fff",
						}}
					/>
					<button
						type="submit"
						disabled={!inputText.trim()}
						style={{
							display: "flex",
							height: 32,
							width: 32,
							flexShrink: 0,
							alignItems: "center",
							justifyContent: "center",
							borderRadius: 8,
							border: "none",
							background: inputText.trim() ? "#7C3AED" : "rgba(124,58,237,0.3)",
							cursor: inputText.trim() ? "pointer" : "not-allowed",
						}}
					>
						<ArrowRightIcon />
					</button>
				</form>
			</div>
		);
	}

	return (
		<div style={shell}>
			<div style={{ display: "flex", minWidth: 0, flex: 1, alignItems: "center", gap: 12 }}>
				{isListening ? (
					<div style={{ display: "flex", height: 24, flexShrink: 0, alignItems: "flex-end", gap: 2, paddingLeft: 8, paddingRight: 8 }}>
						{WAVEFORM_HEIGHTS.map((h, i) => (
							<div
								key={i}
								style={{
									width: 4,
									height: h,
									borderRadius: 9999,
									background: "#7C3AED",
									opacity: 0.85,
								}}
							/>
						))}
					</div>
				) : (
					<div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{shortcutLabel} to speak</div>
				)}
				{isListening && transcript ? (
					<div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace", fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
						{transcript}
					</div>
				) : null}
			</div>

			<div style={{ position: "relative", display: "flex", flexShrink: 0, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
				<button
					type="button"
					onClick={toggleListening}
					title={`${shortcutLabel} — ${isListening ? "Release to send" : "Hold to speak"}`}
					style={{
						display: "flex",
						height: 48,
						width: 48,
						alignItems: "center",
						justifyContent: "center",
						borderRadius: "50%",
						border: isListening ? "none" : "1px solid rgba(124,58,237,0.3)",
						background: isListening ? "#7C3AED" : "rgba(124,58,237,0.15)",
						boxShadow: isListening ? "0 0 24px rgba(124,58,237,0.6)" : undefined,
						transform: isListening ? "scale(1.1)" : undefined,
						cursor: "pointer",
					}}
				>
					<MicIcon color={isListening ? "#fff" : "#7C3AED"} />
				</button>
				<div style={{ position: "absolute", bottom: -16, fontSize: 10, letterSpacing: "0.05em", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>
					{isListening ? "RELEASE TO SEND" : "HOLD TO SPEAK"}
				</div>
			</div>

			<div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
				{isListening ? <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>0:03</div> : null}
				<button
					type="button"
					onClick={() => setIsVoiceMode(false)}
					style={{
						display: "flex",
						height: 28,
						width: 28,
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 6,
						border: "1px solid rgba(255,255,255,0.1)",
						background: "transparent",
						color: "rgba(255,255,255,0.3)",
						cursor: "pointer",
					}}
					title="Switch to text"
				>
					<KeyboardIcon />
				</button>
			</div>
		</div>
	);
}
