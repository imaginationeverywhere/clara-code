import { createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { afterEach, describe, expect, test, vi } from "vitest";

const protectedPatterns = ["/dashboard(.*)", "/account(.*)"];

function makeNextRequest(pathname: string): NextRequest {
	return new NextRequest(new URL(`https://example.com${pathname}`));
}

describe("middleware route protection patterns", () => {
	const isProtectedRoute = createRouteMatcher(protectedPatterns);

	test("protected route paths match /dashboard, /dashboard/anything, /account, /account/billing", () => {
		expect(isProtectedRoute(makeNextRequest("/dashboard"))).toBe(true);
		expect(isProtectedRoute(makeNextRequest("/dashboard/settings"))).toBe(true);
		expect(isProtectedRoute(makeNextRequest("/account"))).toBe(true);
		expect(isProtectedRoute(makeNextRequest("/account/billing"))).toBe(true);
	});

	test("public route paths do not match /, /pricing, /sign-in, /sign-up", () => {
		expect(isProtectedRoute(makeNextRequest("/"))).toBe(false);
		expect(isProtectedRoute(makeNextRequest("/pricing"))).toBe(false);
		expect(isProtectedRoute(makeNextRequest("/sign-in"))).toBe(false);
		expect(isProtectedRoute(makeNextRequest("/sign-up"))).toBe(false);
	});
});

describe("middleware export by Clerk env", () => {
	const orig = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

	afterEach(() => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = orig;
		vi.resetModules();
	});

	test("when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set, default export is a function", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_x";
		const mod = await import("../middleware");
		expect(typeof mod.default).toBe("function");
		expect(mod.default.name).not.toBe("passthrough");
	});

	test("when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is absent, passthrough returns NextResponse.next()", async () => {
		delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
		const mod = await import("../middleware");
		expect(mod.default.name).toBe("passthrough");
		const res = (mod.default as (req: Request) => NextResponse)(new Request("https://example.com/"));
		expect(res).toBeInstanceOf(NextResponse);
		expect(res.status).toBe(200);
	});
});
