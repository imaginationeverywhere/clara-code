export const runtime = "edge";

import { MISSION_LINE, WEB_TEXT_OVERLAY_LINES, webScripts } from "@clara/clara-code-surface-scripts";

/** VRD-001 one-line greeting — used for GET and as default when body has no script match. */
const GREETING = "Hey, welcome. I'm Clara — what are you building?";

function getVoiceBaseUrl(): string {
	const fromEnv = process.env.CLARA_VOICE_URL ?? process.env.NEXT_PUBLIC_CLARA_VOICE_URL;
	if (fromEnv && fromEnv.length > 0) {
		return fromEnv.replace(/\/$/, "");
	}
	return "";
}

type GreetBody = {
	text?: string;
	trigger?: "first-visit" | "return-visit" | "post-oauth" | "demo-offer" | "no-response";
	partnerType?: "vibe-coder" | "developer" | "unknown";
	userName?: string;
};

function capText(s: string, max: number): string {
	if (s.length <= max) return s;
	return s.slice(0, max);
}

function resolveTtsText(body: GreetBody | null): string {
	if (body?.text && body.text.trim().length > 0) {
		return body.text.trim();
	}

	const trigger = body?.trigger;
	const partner = body?.partnerType ?? "unknown";

	if (trigger === "return-visit") {
		return capText(webScripts.a6.voiceLines.join(" "), 500);
	}
	if (trigger === "demo-offer") {
		return capText(webScripts.a5.offerLines[0], 500);
	}
	if (trigger === "post-oauth") {
		return capText(webScripts.a7.voiceLines.join(" "), 500);
	}
	if (trigger === "no-response") {
		return capText(webScripts.a4.voiceLines.join(" "), 500);
	}
	if (trigger === "first-visit") {
		if (partner === "vibe-coder") {
			return capText(webScripts.a2.voiceLines.join(" "), 500);
		}
		if (partner === "developer") {
			return capText(webScripts.a3.voiceLines.join(" "), 500);
		}
		return capText([...WEB_TEXT_OVERLAY_LINES, MISSION_LINE].join(" "), 500);
	}

	return GREETING;
}

async function proxyTts(text: string, cacheControl: string | null): Promise<Response> {
	const base = getVoiceBaseUrl();
	if (!base) {
		return new Response(JSON.stringify({ error: "Voice service is not available" }), {
			status: 503,
			headers: { "Content-Type": "application/json" },
		});
	}
	const response = await fetch(`${base}/voice/tts`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text, voice_id: "clara" }),
	});

	if (!response.ok) {
		return new Response(JSON.stringify({ error: "Voice server unavailable" }), {
			status: 503,
			headers: { "Content-Type": "application/json" },
		});
	}

	const audioBlob = await response.arrayBuffer();
	const contentType = response.headers.get("content-type") ?? "audio/mpeg";
	const headers: Record<string, string> = {
		"Content-Type": contentType,
	};
	if (cacheControl) {
		headers["Cache-Control"] = cacheControl;
	}

	return new Response(audioBlob, { status: 200, headers });
}

export async function GET() {
	try {
		return await proxyTts(GREETING, "public, max-age=3600");
	} catch {
		return new Response(JSON.stringify({ error: "Voice server unavailable" }), {
			status: 503,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export async function POST(req: Request) {
	try {
		let body: GreetBody | null = null;
		try {
			body = (await req.json()) as GreetBody;
		} catch {
			body = null;
		}

		if (typeof body?.text === "string" && body.text.length > 500) {
			return new Response(JSON.stringify({ error: "Text too long (max 500 chars)" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const text = capText(resolveTtsText(body), 500);

		return await proxyTts(text, null);
	} catch {
		return new Response(JSON.stringify({ error: "Voice server unavailable" }), {
			status: 503,
			headers: { "Content-Type": "application/json" },
		});
	}
}
