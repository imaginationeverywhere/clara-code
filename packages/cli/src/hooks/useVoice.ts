import { useCallback, useRef, useState } from "react";
import { type AudioCapture, startCapture } from "../lib/audio-capture.js";
import { claraGateway, type GatewayResult } from "../lib/gateway.js";
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
	startListening: () => void;
	stopAndSend: () => Promise<void>;
	cancel: () => void;
	sendText: (text: string) => Promise<void>;
}

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
	const captureRef = useRef<AudioCapture | null>(null);
	const abortRef = useRef<AbortController | null>(null);

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
		setPhase("idle");
	}, [abortInFlight, cleanupCapture]);

	const sendGatewayMessage = useCallback(
		async (text: string): Promise<void> => {
			setPhase("sending");
			const controller = new AbortController();
			abortRef.current = controller;
			const start = Date.now();
			try {
				const result = await claraGateway(gatewayUrl, userId, text);
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
		[gatewayUrl, onError, onGatewayResult, userId],
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
			if ((err as Error)?.name === "AbortError") {
				setPhase("idle");
				return;
			}
			onError(err instanceof Error ? err.message : String(err));
			setPhase("idle");
			return;
		}
		abortRef.current = null;

		if (onTranscript) onTranscript(transcriptResult);
		if (!transcriptResult.transcript) {
			setPhase("idle");
			return;
		}

		await sendGatewayMessage(transcriptResult.transcript);
	}, [backendUrl, onError, onTranscript, sendGatewayMessage, stubText, token]);

	const sendText = useCallback(
		async (text: string): Promise<void> => {
			await sendGatewayMessage(text);
		},
		[sendGatewayMessage],
	);

	const isMicActive = phase === "listening";
	const isLoading = phase === "transcribing" || phase === "sending";

	return { phase, isMicActive, isLoading, startListening, stopAndSend, cancel, sendText };
}
