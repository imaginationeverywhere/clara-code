import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api-dev.claracode.ai";

type RouteCtx = { params: Promise<{ path?: string[] }> | { path?: string[] } };

async function getSegments(params: RouteCtx["params"]): Promise<string[] | undefined> {
	const p = await Promise.resolve(params);
	return p.path;
}

async function forward(req: Request, pathSegments: string[] | undefined): Promise<Response> {
	const { userId, getToken } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const sub = (pathSegments ?? []).join("/");
	if (!sub) {
		return NextResponse.json({ error: "Path required" }, { status: 400 });
	}
	const token = await getToken();
	const target = `${BACKEND_URL}/api/billing/${sub}`;

	const init: RequestInit = {
		method: req.method,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};

	if (req.method !== "GET" && req.method !== "HEAD") {
		const body = await req.text();
		(init as { body?: string }).body = body;
		(init.headers as Record<string, string>)["Content-Type"] = "application/json";
	}

	const res = await fetch(target, init);
	const data = (await res.text()) as string;
	return new NextResponse(data, {
		status: res.status,
		headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
	});
}

export async function GET(_req: Request, ctx: RouteCtx): Promise<Response> {
	return forward(_req, await getSegments(ctx.params));
}

export async function POST(req: Request, ctx: RouteCtx): Promise<Response> {
	return forward(req, await getSegments(ctx.params));
}
