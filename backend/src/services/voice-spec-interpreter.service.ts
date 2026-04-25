import Anthropic from "@anthropic-ai/sdk";
import type { MobileStructuredSpec } from "@/models/MobileUpdateRequest";
import type { SiteAgentDeployment } from "@/models/SiteAgentDeployment";
import { logger } from "@/utils/logger";

/**
 * Interprets a mobile voice note into a structured spec JSON (used by `MobileNoteCaptureService`).
 * Uses Anthropic when ANTHROPIC_API_KEY is set; otherwise a deterministic local fallback.
 */
export async function interpretTranscriptToMobileSpec(
	transcript: string,
	_deployment: SiteAgentDeployment,
): Promise<MobileStructuredSpec & { category: string }> {
	const prompt = `You are interpreting a SITE_OWNER's voice note for a mobile app update queue.
Transcript: ${JSON.stringify(transcript)}

Reply with ONLY a single JSON object (no markdown) with these fields:
{
  "restatement": "one-sentence clear restatement of what they want",
  "title": "short PR-title-style (under 60 chars)",
  "description": "full description for engineers",
  "acceptance_criteria": ["bullet list of criteria"],
  "affected_screens": ["screen names"],
  "priority_guess": "low|normal|high|urgent",
  "category": "content|behavior|new_feature|bug_fix"
}`;

	const key = process.env.ANTHROPIC_API_KEY?.trim();
	if (key) {
		try {
			const client = new Anthropic({ apiKey: key });
			const msg = await client.messages.create({
				model: process.env.ANTHROPIC_SPEC_MODEL?.trim() || "claude-3-5-haiku-20241022",
				max_tokens: 1024,
				messages: [{ role: "user", content: prompt }],
			});
			const block = msg.content[0];
			if (block?.type !== "text") {
				return fallbackFromTranscript(transcript);
			}
			const parsed = JSON.parse(block.text) as unknown;
			return normalizeSpec(parsed, transcript);
		} catch (e) {
			logger.warn("voice-spec-interpreter: Anthropic call failed, using fallback", e);
		}
	}
	return fallbackFromTranscript(transcript);
}

function fallbackFromTranscript(transcript: string): MobileStructuredSpec & { category: string } {
	return {
		restatement: transcript.length > 120 ? `${transcript.slice(0, 117)}...` : transcript,
		title: transcript.slice(0, 60) || "Mobile update request",
		description: transcript,
		acceptance_criteria: [],
		affected_screens: [],
		priority_guess: "normal",
		category: "new_feature",
	};
}

function normalizeSpec(raw: unknown, transcript: string): MobileStructuredSpec & { category: string } {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return fallbackFromTranscript(transcript);
	}
	const o = raw as Record<string, unknown>;
	const pr = o.priority_guess;
	const priority: MobileStructuredSpec["priority_guess"] =
		pr === "low" || pr === "normal" || pr === "high" || pr === "urgent" ? pr : "normal";
	const ac = o.acceptance_criteria;
	const screens = o.affected_screens;
	return {
		restatement: typeof o.restatement === "string" ? o.restatement : fallbackFromTranscript(transcript).restatement,
		title: typeof o.title === "string" ? o.title.slice(0, 60) : fallbackFromTranscript(transcript).title,
		description: typeof o.description === "string" ? o.description : String(transcript),
		acceptance_criteria: Array.isArray(ac) ? ac.map((s) => String(s)) : [],
		affected_screens: Array.isArray(screens) ? screens.map((s) => String(s)) : [],
		priority_guess: priority,
		category: typeof o.category === "string" ? o.category : "behavior",
	};
}
