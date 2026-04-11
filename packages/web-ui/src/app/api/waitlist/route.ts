import { NextResponse } from "next/server";

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

	const backendUrl = process.env.CLARA_CODE_BACKEND_URL?.trim();
	if (!backendUrl) {
		console.log("[waitlist]", JSON.stringify({ email, name, ts: new Date().toISOString(), mode: "log-only" }));
		return NextResponse.json({ success: true });
	}

	const target = `${backendUrl.replace(/\/$/, "")}/api/waitlist`;

	try {
		const upstream = await fetch(target, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, name }),
		});

		const text = await upstream.text();
		const contentType = upstream.headers.get("content-type") ?? "application/json";

		return new NextResponse(text, {
			status: upstream.status,
			headers: { "Content-Type": contentType },
		});
	} catch (err) {
		console.error("[waitlist] backend request failed", err);
		return NextResponse.json({ success: false, error: "Waitlist unavailable" }, { status: 503 });
	}
}
