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

const mockList = jest.fn();
const mockCreateSession = jest.fn();

jest.mock("stripe", () => {
	return jest.fn().mockImplementation(() => ({
		customers: {
			create: jest.fn().mockResolvedValue({ id: "cus_test123" }),
		},
		prices: {
			list: (...args: unknown[]) => mockList(...args),
		},
		checkout: {
			sessions: {
				create: (...args: unknown[]) => mockCreateSession(...args),
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

	beforeEach(() => {
		process.env.STRIPE_SECRET_KEY = "sk_test_123";
		process.env.FRONTEND_URL = "https://claracode.com";
		mockList.mockResolvedValue({
			data: [
				{
					id: "price_pro_dyn",
					type: "recurring",
					metadata: { clara_tier: "pro" },
				},
				{
					id: "price_bus_dyn",
					type: "recurring",
					metadata: { clara_tier: "business" },
				},
			],
		});
		mockCreateSession.mockResolvedValue({ url: "https://checkout.stripe.test/session" });
	});

	afterEach(() => {
		process.env.STRIPE_SECRET_KEY = origKey;
		jest.clearAllMocks();
	});

	it("400 when tier is invalid", async () => {
		const res = await request(app).post("/checkout/create-session").send({ tier: "enterprise" });
		expect(res.status).toBe(400);
	});

	it("returns checkout URL for pro tier and uses dynamic price list", async () => {
		const res = await request(app).post("/checkout/create-session").send({ tier: "pro" });
		expect(res.status).toBe(200);
		expect(res.body.url).toContain("https://");
		expect(mockList).toHaveBeenCalled();
		expect(mockCreateSession).toHaveBeenCalledWith(
			expect.objectContaining({
				line_items: [{ price: "price_pro_dyn", quantity: 1 }],
			}),
		);
	});

	it("503 when Stripe secret not configured", async () => {
		delete process.env.STRIPE_SECRET_KEY;
		const res = await request(app).post("/checkout/create-session").send({ tier: "pro" });
		expect(res.status).toBe(503);
		process.env.STRIPE_SECRET_KEY = "sk_test_123";
	});

	it("503 when no active price found for tier", async () => {
		mockList.mockResolvedValueOnce({ data: [] });
		const res = await request(app).post("/checkout/create-session").send({ tier: "pro" });
		expect(res.status).toBe(503);
		expect(res.body.error).toContain("contact support");
	});

	it("401 when unauthenticated", async () => {
		const app2 = express();
		app2.use(express.json());
		app2.use("/checkout", checkoutRoutes);
		const res = await request(app2).post("/checkout/create-session").send({ tier: "pro" });
		expect(res.status).toBe(401);
	});
});
