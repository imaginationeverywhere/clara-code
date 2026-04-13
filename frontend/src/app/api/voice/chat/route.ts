export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { checkIpRateLimit } from "@/lib/ip-rate-limit";

const DEFAULT_HERMES_GATEWAY_URL = "https://info-24346--hermes-gateway.modal.run";

const FALLBACK_BODY = {
	text: "Clara is unavailable right now.",
	audio_url: null as string | null,
} as const;

function hermesBaseUrl(): string {
	const raw = process.env.HERMES_GATEWAY_URL?.trim();
	return raw && raw.length > 0 ? raw : DEFAULT_HERMES_GATEWAY_URL;
}

function clientIp(request: Request): string {
	const xf = request.headers.get("x-forwarded-for");
	if (xf) {
		const first = xf.split(",")[0]?.trim();
		if (first) return first;
	}
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp.trim();
	return "unknown";
}

type HermesSuccess = {
	text?: string;
	audio_url?: string | null;
};

export async function POST(request: Request): Promise<NextResponse> {
	const ip = clientIp(request);
	if (!checkIpRateLimit(`voice-chat:${ip}`, 20, 60_000)) {
		return NextResponse.json({ error: "Voice rate limit exceeded. Slow down." }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (!body || typeof body !== "object") {
		return NextResponse.json({ error: "Expected JSON object body" }, { status: 400 });
	}

	const message = (body as { message?: unknown }).message;
	if (typeof message !== "string" || message.trim().length === 0) {
		return NextResponse.json({ error: "Missing or empty message" }, { status: 400 });
	}

	const userIdRaw = (body as { userId?: unknown }).userId;
	const user = typeof userIdRaw === "string" && userIdRaw.trim().length > 0 ? userIdRaw.trim() : "guest";

	const base = hermesBaseUrl().replace(/\/$/, "");

	try {
		const upstream = await fetch(base, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				platform: "web",
				user,
				message: message.trim(),
			}),
		});

		if (!upstream.ok) {
			return NextResponse.json({ ...FALLBACK_BODY }, { status: 200 });
		}

		const data = (await upstream.json()) as HermesSuccess;
		const text = typeof data.text === "string" ? data.text : "";
		const audio_url = data.audio_url === null || data.audio_url === undefined ? null : String(data.audio_url);

		return NextResponse.json({ text, audio_url });
	} catch {
		return NextResponse.json({ ...FALLBACK_BODY }, { status: 200 });
	}
}
