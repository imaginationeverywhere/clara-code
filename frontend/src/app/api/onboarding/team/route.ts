export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api-dev.claracode.ai";

export async function POST(req: Request) {
	const { userId, getToken } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body: unknown = await req.json();
	const token = await getToken();

	const res = await fetch(`${BACKEND_URL}/api/onboarding/team`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	});

	const data = (await res.json()) as unknown;
	return NextResponse.json(data, { status: res.status });
}
