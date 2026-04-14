import express from "express";
import request from "supertest";

jest.mock("@clerk/express", () => ({
	requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

jest.mock("@/models/Subscription", () => ({
	Subscription: {
		findOne: jest.fn().mockResolvedValue(null),
		create: jest.fn().mockResolvedValue(undefined),
	},
}));

jest.mock("stripe", () => {
	return jest.fn().mockImplementation(() => ({
		customers: {
			create: jest.fn().mockResolvedValue({ id: "cus_test123" }),
		},
		checkout: {
			sessions: {
				create: jest.fn().mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
			},
		},
	}));
});

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import checkoutRoutes from "@/routes/checkout";

const app = express();
app.use((req, _res, next) => {
	(req as { auth?: () => Promise<{ userId: string }> }).auth = () => Promise.resolve({ userId: "user_test" });
	next();
});
app.use(express.json());
app.use("/checkout", checkoutRoutes);

describe("POST /checkout/create-session", () => {
	const origKey = process.env.STRIPE_SECRET_KEY;
	const origPro = process.env.STRIPE_PRICE_PRO;

	beforeEach(() => {
		process.env.STRIPE_SECRET_KEY = "sk_test_123";
		process.env.STRIPE_PRICE_PRO = "price_pro_test";
		process.env.STRIPE_PRICE_BUSINESS = "price_bus_test";
		process.env.FRONTEND_URL = "https://claracode.com";
	});

	afterEach(() => {
		process.env.STRIPE_SECRET_KEY = origKey;
		process.env.STRIPE_PRICE_PRO = origPro;
	});

	it("400 when tier is invalid", async () => {
		const res = await request(app).post("/checkout/create-session").send({ tier: "enterprise" });
		expect(res.status).toBe(400);
	});

	it("returns checkout URL for pro tier", async () => {
		const res = await request(app).post("/checkout/create-session").send({ tier: "pro" });
		expect(res.status).toBe(200);
		expect(res.body.url).toContain("https://");
	});

	it("503 when Stripe secret not configured", async () => {
		delete process.env.STRIPE_SECRET_KEY;
		const res = await request(app).post("/checkout/create-session").send({ tier: "pro" });
		expect(res.status).toBe(503);
		process.env.STRIPE_SECRET_KEY = "sk_test_123";
	});

	it("503 when price ID missing for tier", async () => {
		delete process.env.STRIPE_PRICE_PRO;
		const res = await request(app).post("/checkout/create-session").send({ tier: "pro" });
		expect(res.status).toBe(503);
		process.env.STRIPE_PRICE_PRO = "price_pro_test";
	});
});
