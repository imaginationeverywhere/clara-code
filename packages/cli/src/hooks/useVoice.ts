import type { PartnerType } from "@clara/clara-code-surface-scripts";
import { useCallback, useRef, useState } from "react";
import type { GatewayResult } from "../lib/gateway.js";
import { claraGateway } from "../lib/gateway.js";

interface UseVoiceOptions {
	gatewayUrl: string;
	userId: string;
	voiceOptIn: boolean;
	getPartnerType: () => PartnerType;
	getSixSideProjectsAsked: () => boolean;
	onReply: (result: GatewayResult, latencyMs: number) => void;
	onError: (error: string) => void;
}

interface UseVoiceReturn {
	isMicActive: boolean;
	isLoading: boolean;
	toggleMic: () => void;
	sendText: (text: string) => Promise<void>;
}

export function useVoice({
	gatewayUrl,
	userId,
	voiceOptIn,
	getPartnerType,
	getSixSideProjectsAsked,
	onReply,
	onError,
}: UseVoiceOptions): UseVoiceReturn {
	const [isMicActive, setIsMicActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const toggleMic = useCallback(() => {
		if (isMicActive) {
			if (intervalRef.current) clearInterval(intervalRef.current);
			setIsMicActive(false);
		} else {
			setIsMicActive(true);
		}
	}, [isMicActive]);

	const sendText = useCallback(
		async (text: string) => {
			setIsLoading(true);
			const start = Date.now();
			try {
				const result = await claraGateway({
					gatewayUrl,
					userId,
					message: text,
					partnerType: getPartnerType(),
					sixSideProjectsAsked: getSixSideProjectsAsked(),
					voiceOptIn,
				});
				onReply(result, Date.now() - start);
			} catch (err) {
				onError(err instanceof Error ? err.message : String(err));
			} finally {
				setIsLoading(false);
			}
		},
		[gatewayUrl, userId, voiceOptIn, getPartnerType, getSixSideProjectsAsked, onReply, onError],
	);

	return { isMicActive, isLoading, toggleMic, sendText };
}
