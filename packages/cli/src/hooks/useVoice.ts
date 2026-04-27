import { useCallback, useRef, useState } from "react";
import { type AudioCapture, startCapture } from "../lib/audio-capture.js";
import { claraGateway, type GatewayResult } from "../lib/gateway.js";
import { writeMinutesCache } from "../lib/minutes-cache.js";
import { requestTranscript, type SttResult } from "../lib/stt-client.js";

export type VoicePhase = "idle" | "listening" | "transcribing" | "sending";

export interface UseVoiceOptions {
	gatewayUrl: string;
	backendUrl: string;
	token: string;
	userId: string;
	/** Optional. Forwarded to the backend dev stub via `stubText` / `x-clara-stub-text`. */
	stubText?: string;
	onTranscript?: (result: SttResult) => void;
	onGatewayResult: (result: GatewayResult, latencyMs: number) => void;
	onError: (error: string) => void;
}

export interface UseVoiceReturn {
	phase: VoicePhase;
	isMicActive: boolean;
	isLoading: boolean;
	/**
	 * True when the current `transcribing` call has been running long enough that we suspect
	 * the Modal GPU is doing a cold-start load (A10G scales to zero, Whisper+XTTS load = 60–120s
	 * per the cp-team handoff). The TUI surfaces this as a "warming up…" message so the user
	 * doesn't think we froze.
	 */
	warming: boolean;
	startListening: () => void;
	stopAndSend: () => Promise<void>;
	cancel: () => void;
	sendText: (text: string) => Promise<void>;
}

/** Show the warmup message if transcription takes longer than this. */
const WARMUP_HINT_MS = 4_000;

/**
 * End-to-end voice loop for the Clara CLI:
 *
 *   startListening → (mic open, sox captures) → stopAndSend → /api/voice/stt → gateway → result
 *
 * `cancel()` aborts whatever phase we're in — during `listening` it discards captured audio,
 * during `transcribing` / `sending` it aborts the in-flight fetch. Against the backend dev stub
 * (`CLARA_VOICE_DEV_STUB=1`) the whole path works with no audio hardware: the stub ignores the
 * body and returns a mock transcript which we still hand to the gateway as real text.
 */
export function useVoice(options: UseVoiceOptions): UseVoiceReturn {
	const { gatewayUrl, backendUrl, token, userId, stubText, onGatewayResult, onError, onTranscript } = options;

	const [phase, setPhase] = useState<VoicePhase>("idle");
	const [warming, setWarming] = useState(false);
	const captureRef = useRef<AudioCapture | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const warmupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearWarmup = useCallback(() => {
		if (warmupTimerRef.current) {
			clearTimeout(warmupTimerRef.current);
			warmupTimerRef.current = null;
		}
		setWarming(false);
	}, []);

	const armWarmup = useCallback(() => {
		clearWarmup();
		warmupTimerRef.current = setTimeout(() => {
			setWarming(true);
		}, WARMUP_HINT_MS);
	}, [clearWarmup]);

	const cleanupCapture = useCallback(() => {
		captureRef.current?.cancel();
		captureRef.current = null;
	}, []);

	const abortInFlight = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
	}, []);

	const startListening = useCallback(() => {
		if (captureRef.current) return;
		captureRef.current = startCapture();
		setPhase("listening");
	}, []);

	const cancel = useCallback(() => {
		cleanupCapture();
		abortInFlight();
		clearWarmup();
		setPhase("idle");
	}, [abortInFlight, cleanupCapture, clearWarmup]);

	const sendGatewayMessage = useCallback(
		async (text: string): Promise<void> => {
			setPhase("sending");
			const controller = new AbortController();
			abortRef.current = controller;
			const start = Date.now();
			try {
				const result = await claraGateway(gatewayUrl, userId, text, { bearerToken: token });
				if (result.minutesRemaining != null) {
					writeMinutesCache(result.minutesRemaining);
				}
				onGatewayResult(result, Date.now() - start);
			} catch (err) {
				if ((err as Error)?.name === "AbortError") {
					// user cancelled — silent
				} else {
					onError(err instanceof Error ? err.message : String(err));
				}
			} finally {
				abortRef.current = null;
				setPhase("idle");
			}
		},
		[gatewayUrl, onError, onGatewayResult, userId, token],
	);

	const stopAndSend = useCallback(async (): Promise<void> => {
		const capture = captureRef.current;
		if (!capture) return;
		captureRef.current = null;
		setPhase("transcribing");
		let audio: Buffer;
		try {
			audio = await capture.stop();
		} catch (err) {
			onError(err instanceof Error ? err.message : String(err));
			setPhase("idle");
			return;
		}

		const controller = new AbortController();
		abortRef.current = controller;
		armWarmup();
		let transcriptResult: SttResult;
		try {
			transcriptResult = await requestTranscript({
				backendUrl,
				token,
				audio,
				mimeType: "audio/wav",
				...(stubText ? { stubText } : {}),
				signal: controller.signal,
			});
		} catch (err) {
			abortRef.current = null;
			clearWarmup();
			if ((err as Error)?.name === "AbortError") {
				setPhase("idle");
				return;
			}
			onError(err instanceof Error ? err.message : String(err));
			setPhase("idle");
			return;
		}
		abortRef.current = null;
		clearWarmup();

		if (onTranscript) onTranscript(transcriptResult);
		if (!transcriptResult.transcript) {
			setPhase("idle");
			return;
		}

		await sendGatewayMessage(transcriptResult.transcript);
	}, [armWarmup, backendUrl, clearWarmup, onError, onTranscript, sendGatewayMessage, stubText, token]);

	const sendText = useCallback(
		async (text: string): Promise<void> => {
			await sendGatewayMessage(text);
		},
		[sendGatewayMessage],
	);

	const isMicActive = phase === "listening";
	const isLoading = phase === "transcribing" || phase === "sending";

	return { phase, isMicActive, isLoading, warming, startListening, stopAndSend, cancel, sendText };
}
