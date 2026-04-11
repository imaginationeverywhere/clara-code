import { useCallback, useState } from "react";
import { claraGateway, type GatewayResult } from "../lib/gateway.js";

export interface UseVoiceOptions {
	gatewayUrl: string;
	userId: string;
	onGatewayResult: (result: GatewayResult, latencyMs: number) => void;
	onError: (error: string) => void;
}

export interface UseVoiceReturn {
	isMicActive: boolean;
	isLoading: boolean;
	toggleMic: () => void;
	sendText: (text: string) => Promise<void>;
}

/**
 * Text-first gateway client. Mic toggles local “recording” UI only (no Node STT).
 */
export function useVoice({ gatewayUrl, userId, onGatewayResult, onError }: UseVoiceOptions): UseVoiceReturn {
	const [isMicActive, setIsMicActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const toggleMic = useCallback(() => {
		setIsMicActive((v) => !v);
	}, []);

	const sendText = useCallback(
		async (text: string) => {
			setIsLoading(true);
			const start = Date.now();
			try {
				const result = await claraGateway(gatewayUrl, userId, text);
				onGatewayResult(result, Date.now() - start);
			} catch (err) {
				onError(err instanceof Error ? err.message : String(err));
			} finally {
				setIsLoading(false);
			}
		},
		[gatewayUrl, userId, onGatewayResult, onError],
	);

	return { isMicActive, isLoading, toggleMic, sendText };
}
