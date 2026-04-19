export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api-dev.claracode.ai";

export async function POST(req: Request) {
	const { userId, getToken } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await req.json()) as { audioBase64?: string };
	if (typeof body.audioBase64 !== "string" || body.audioBase64.length === 0) {
		return NextResponse.json({ error: "audioBase64 required" }, { status: 400 });
	}

	const token = await getToken();
	const res = await fetch(`${BACKEND_URL}/api/voice/clone`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ audioBase64: body.audioBase64 }),
	});

	const data = (await res.json()) as unknown;
	return NextResponse.json(data, { status: res.status });
}
