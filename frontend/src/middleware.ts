import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Clerk middleware is disabled until NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
// and CLERK_SECRET_KEY are set in GH Actions / CF Pages env vars.
// Without keys, clerkMiddleware throws at startup → 500 on every route.
// TODO: Replace with clerkMiddleware once keys are wired.
export function middleware(_req: NextRequest) {
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
