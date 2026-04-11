import { NextResponse } from "next/server";

const TTS_URL = "https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/tts";

export async function GET() {
	const upstream = await fetch(TTS_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			text: "Hey, I am Clara. I help developers code faster with voice.",
			voice_id: "default",
		}),
	});

	if (!upstream.ok) {
		return new NextResponse("Upstream voice service error", { status: 502 });
	}

	const buffer = await upstream.arrayBuffer();
	const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";

	return new NextResponse(buffer, {
		headers: {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=300",
		},
	});
}
