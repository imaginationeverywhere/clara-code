import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api-dev.claracode.ai";

export async function POST(req: Request) {
	const { userId, getToken } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await req.json()) as { tier?: string };
	const token = await getToken();

	const res = await fetch(`${BACKEND_URL}/api/checkout/create-session`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ tier: body.tier }),
	});

	const data = (await res.json()) as unknown;
	return NextResponse.json(data, { status: res.status });
}
