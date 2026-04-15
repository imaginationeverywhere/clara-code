import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const client = await clerkClient();
		await client.users.deleteUser(userId);
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Delete failed" }, { status: 500 });
	}
}
