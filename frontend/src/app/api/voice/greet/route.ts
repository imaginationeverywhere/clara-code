export const dynamic = "force-dynamic";

import { webScripts } from "@clara/clara-code-surface-scripts";
import { NextResponse } from "next/server";

const DEFAULT_CLARA_VOICE_URL = "https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run";

function buildA1Message(): string {
	return webScripts.a1.voiceLines.join("\n");
}

export async function GET() {
	const base = process.env.CLARA_VOICE_URL ?? DEFAULT_CLARA_VOICE_URL;
	const respondUrl = `${base.replace(/\/$/, "")}/voice/respond`;

	const upstream = await fetch(respondUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			agent: "clara",
			surface: "A1",
			message: buildA1Message(),
		}),
	});

	if (!upstream.ok) {
		return new NextResponse("Upstream voice service error", { status: 502 });
	}

	const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";

	if (upstream.body) {
		return new NextResponse(upstream.body, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=300",
			},
		});
	}

	const buffer = await upstream.arrayBuffer();
	return new NextResponse(buffer, {
		headers: {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=300",
		},
	});
}
