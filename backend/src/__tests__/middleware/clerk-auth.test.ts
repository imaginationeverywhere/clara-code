import express from "express";
import request from "supertest";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { requireRole, syncUserMiddleware, withAuth } from "@/middleware/clerk-auth";

jest.mock("@/utils/logger", () => ({
	logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock("@/models/User", () => ({
	User: {
		findByClerkId: jest.fn(),
	},
}));

import { User } from "@/models/User";

describe("clerk-auth middleware", () => {
	it("withAuth attaches auth getter", async () => {
		const app = express();
		app.use(withAuth);
		app.get("/t", (req: AuthenticatedRequest, res) => {
			expect(typeof req.auth).toBe("function");
			res.json({ ok: true });
		});
		const res = await request(app).get("/t");
		expect(res.status).toBe(200);
	});

	it("syncUserMiddleware sets user when found", async () => {
		(User.findByClerkId as jest.Mock).mockResolvedValueOnce({
			id: "db1",
			role: "USER",
			email: "a@b.com",
		});
		const app = express();
		app.use((req: AuthenticatedRequest, _res, next) => {
			req.auth = async () => ({ userId: "user_clerk" }) as never;
			next();
		});
		app.use(syncUserMiddleware);
		app.get("/t", (req: AuthenticatedRequest, res) => {
			res.json({ hasUser: !!req.user });
		});
		const res = await request(app).get("/t");
		expect(res.status).toBe(200);
		expect(res.body.hasUser).toBe(true);
	});

	it("syncUserMiddleware continues when user missing in DB", async () => {
		(User.findByClerkId as jest.Mock).mockResolvedValueOnce(null);
		const app = express();
		app.use((req: AuthenticatedRequest, _res, next) => {
			req.auth = async () => ({ userId: "user_clerk" }) as never;
			next();
		});
		app.use(syncUserMiddleware);
		app.get("/t", (_req, res) => res.json({ ok: true }));
		const res = await request(app).get("/t");
		expect(res.status).toBe(200);
	});

	it("syncUserMiddleware returns 500 on error", async () => {
		(User.findByClerkId as jest.Mock).mockRejectedValueOnce(new Error("db"));
		const app = express();
		app.use((req: AuthenticatedRequest, _res, next) => {
			req.auth = async () => ({ userId: "user_clerk" }) as never;
			next();
		});
		app.use(syncUserMiddleware);
		app.get("/t", (_req, res) => res.json({ ok: true }));
		const res = await request(app).get("/t");
		expect(res.status).toBe(500);
	});

	it("requireRole allows when role matches metadata", async () => {
		const app = express();
		app.use((req: AuthenticatedRequest, _res, next) => {
			req.auth = async () =>
				({
					userId: "u1",
					sessionClaims: { metadata: { role: "ADMIN" } },
				}) as never;
			next();
		});
		app.get("/admin", requireRole(["ADMIN"]), (_req, res) => res.json({ ok: true }));
		const res = await request(app).get("/admin");
		expect(res.status).toBe(200);
	});

	it("requireRole 401 without userId", async () => {
		const app = express();
		app.use((req: AuthenticatedRequest, _res, next) => {
			req.auth = async () => ({ userId: null }) as never;
			next();
		});
		app.get("/admin", requireRole(["ADMIN"]), (_req, res) => res.json({ ok: true }));
		const res = await request(app).get("/admin");
		expect(res.status).toBe(401);
	});

	it("requireRole 403 when role not allowed", async () => {
		const app = express();
		app.use((req: AuthenticatedRequest, _res, next) => {
			req.auth = async () =>
				({
					userId: "u1",
					sessionClaims: { metadata: { role: "USER" } },
				}) as never;
			next();
		});
		app.get("/admin", requireRole(["ADMIN"]), (_req, res) => res.json({ ok: true }));
		const res = await request(app).get("/admin");
		expect(res.status).toBe(403);
	});

	it("requireRole defaults metadata role to customer for inclusion check", async () => {
		const app = express();
		app.use((req: AuthenticatedRequest, _res, next) => {
			req.auth = async () => ({ userId: "u1", sessionClaims: {} }) as never;
			next();
		});
		app.get("/r", requireRole(["customer"]), (_req, res) => res.json({ ok: true }));
		const res = await request(app).get("/r");
		expect(res.status).toBe(200);
	});
});
