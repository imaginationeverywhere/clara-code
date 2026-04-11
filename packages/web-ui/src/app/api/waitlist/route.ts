import { appendFile } from "node:fs/promises";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const WAITLIST_PATH = "/tmp/waitlist.json";

type WaitlistBody = {
	email?: unknown;
	name?: unknown;
};

export async function POST(request: Request) {
	let body: WaitlistBody;
	try {
		body = (await request.json()) as WaitlistBody;
	} catch {
		return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
	}

	const email = typeof body.email === "string" ? body.email.trim() : "";
	const name = typeof body.name === "string" ? body.name.trim() : "";

	const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	if (!emailOk) {
		return NextResponse.json({ success: false, error: "Valid email required" }, { status: 400 });
	}

	const line = `${JSON.stringify({
		email,
		name,
		ts: new Date().toISOString(),
	})}\n`;

	await appendFile(WAITLIST_PATH, line, "utf8");

	return NextResponse.json({ success: true });
}
