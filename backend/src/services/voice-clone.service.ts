import axios from "axios";
import { UserVoiceClone } from "@/models/UserVoiceClone";
import { logger } from "@/utils/logger";

function voiceTtsBase(): string {
	const v = process.env.CLARA_VOICE_URL?.trim();
	if (v) return v.replace(/\/$/, "");
	return "";
}

function devStubEnabled(): boolean {
	const v = process.env.CLARA_VOICE_DEV_STUB;
	return v === "1" || v === "true";
}

/**
 * Clones a voice from a 16kHz+ WAV/PCM base64 sample (same contract as `POST /api/voice/clone`).
 * Returns the voice_id used in TTS (e.g. `${userId}-custom`).
 */
export const voiceCloneService = {
	async cloneFromSample(userId: string, audioBase64: string): Promise<string> {
		if (devStubEnabled()) {
			const stub = `dev-stub-${userId}`;
			logger.info("voice_clone_dev_stub", { userId, voiceId: stub });
			return stub;
		}
		const base = voiceTtsBase();
		if (base.length === 0) {
			throw new Error("voice_unavailable");
		}
		const voiceId = `${userId}-custom`;
		const cloneUrl = `${base}/voice/clone`;
		await axios.post(
			cloneUrl,
			{
				voice_id: voiceId,
				audio_base64: audioBase64,
				sample_rate: 16_000,
			},
			{ timeout: 120_000 },
		);

		const existing = await UserVoiceClone.findByUserId(userId);
		if (existing) {
			await existing.update({ voiceId, sampleUrl: null, isDefault: true });
		} else {
			await UserVoiceClone.create({ userId, voiceId, sampleUrl: null, isDefault: true });
		}
		return voiceId;
	},
};
