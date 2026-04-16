import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/account(.*)"]);

// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is baked into the CF Pages build at build time.
// When Mo adds the key to CF Pages env vars and CF re-builds, CLERK_ENABLED becomes true.
// This guard prevents a startup crash when keys are absent (e.g., local dev without .env.local).
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default CLERK_ENABLED
	? clerkMiddleware(async (auth, req) => {
			if (isProtectedRoute(req)) {
				await auth.protect();
			}
		})
	: function passthrough(_req: NextRequest) {
			return NextResponse.next();
		};

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
