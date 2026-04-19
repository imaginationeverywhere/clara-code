export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

function getVoiceBaseUrl(): string {
	const fromEnv = process.env.CLARA_VOICE_URL ?? process.env.NEXT_PUBLIC_CLARA_VOICE_URL;
	if (fromEnv && fromEnv.length > 0) {
		return fromEnv.replace(/\/$/, "");
	}
	return "";
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as { text?: string; voice?: string };
		const text = typeof body.text === "string" ? body.text : "";
		if (text.length === 0) {
			return NextResponse.json({ error: "Missing text" }, { status: 400 });
		}
		if (text.length > 500) {
			return NextResponse.json({ error: "Text too long (max 500 chars)" }, { status: 400 });
		}

		const voiceId = body.voice === "clara" || body.voice === undefined ? "clara" : body.voice;

		const base = getVoiceBaseUrl();
		if (!base) {
			return NextResponse.json({ error: "Voice service is not available" }, { status: 503 });
		}

		const response = await fetch(`${base}/voice/tts`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text, voice_id: voiceId }),
		});

		if (!response.ok) {
			return NextResponse.json({ error: "Voice server unavailable" }, { status: 503 });
		}

		const audioBlob = await response.arrayBuffer();
		const contentType = response.headers.get("content-type") ?? "audio/mpeg";
		return new NextResponse(audioBlob, {
			status: 200,
			headers: {
				"Content-Type": contentType,
			},
		});
	} catch {
		return NextResponse.json({ error: "Voice server unavailable" }, { status: 503 });
	}
}
