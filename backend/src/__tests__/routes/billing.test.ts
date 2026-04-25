import express from "express";
import request from "supertest";

jest.mock("@clerk/express", () => ({
	requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

jest.mock("@/services/clerk-sync.service", () => ({
	syncClerkMetadata: jest.fn().mockResolvedValue(undefined),
}));

const mockList = jest.fn();
const mockRetrieve = jest.fn();
const mockSubUpdate = jest.fn();
const mockSubCancel = jest.fn();
const mockCreateSession = jest.fn();
const mockInvList = jest.fn();
const mockRefund = jest.fn();

jest.mock("stripe", () => {
	return jest.fn().mockImplementation(() => ({
		customers: {
			create: jest.fn().mockResolvedValue({ id: "cus_t" }),
		},
		prices: { list: (...a: unknown[]) => mockList(...a) },
		checkout: {
			sessions: { create: (...a: unknown[]) => mockCreateSession(...a) },
		},
		subscriptions: {
			retrieve: (...a: unknown[]) => mockRetrieve(...a),
			update: (...a: unknown[]) => mockSubUpdate(...a),
			cancel: (...a: unknown[]) => mockSubCancel(...a),
		},
		invoices: { list: (...a: unknown[]) => mockInvList(...a) },
		refunds: { create: (...a: unknown[]) => mockRefund(...a) },
	}));
});

jest.mock("@/models/Subscription", () => ({
	Subscription: {
		findOne: jest.fn(),
		create: jest.fn().mockResolvedValue({}),
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn(), warn: jest.fn() },
}));

import { Subscription } from "@/models/Subscription";
import billingRoutes from "@/routes/billing";

const app = express();
app.use((req, _res, next) => {
	(req as { auth?: () => Promise<{ userId: string }> }).auth = () => Promise.resolve({ userId: "user_1" });
	next();
});
app.use(express.json());
app.use("/billing", billingRoutes);

describe("/api/billing (mounted as /billing in test)", () => {
	const origKey = process.env.STRIPE_SECRET_KEY;
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.STRIPE_SECRET_KEY = "sk_test";
		process.env.FRONTEND_URL = "https://claracode.com";
		mockList.mockResolvedValue({
			data: [
				{ id: "price_p", type: "recurring", metadata: { clara_tier: "pro" } },
				{ id: "price_m", type: "recurring", metadata: { clara_tier: "max" } },
			],
		});
	});

	afterEach(() => {
		process.env.STRIPE_SECRET_KEY = origKey;
	});

	it("POST /checkout returns checkout_url and rejects enterprise", async () => {
		mockCreateSession.mockResolvedValue({ url: "https://checkout.test/s" });
		const bad = await request(app).post("/billing/checkout").send({ tier: "enterprise" });
		expect(bad.status).toBe(400);
		const ok = await request(app).post("/billing/checkout").send({ tier: "pro" });
		expect(ok.status).toBe(200);
		expect(ok.body.checkout_url).toContain("https://");
	});

	it("POST /cancel returns 404 without subscription", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValue(null);
		const r = await request(app).post("/billing/cancel").send({});
		expect(r.status).toBe(404);
	});

	it("POST /cancel updates subscription and Stripe", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValue({
			stripeSubscriptionId: "sub_1",
			tier: "pro",
			update: jest.fn().mockResolvedValue(undefined),
		});
		mockSubUpdate.mockResolvedValue({
			current_period_end: Math.floor(Date.now() / 1000) + 3600,
		});
		const r = await request(app).post("/billing/cancel").send({});
		expect(r.status).toBe(200);
		expect(mockSubUpdate).toHaveBeenCalledWith("sub_1", { cancel_at_period_end: true });
	});

	it("POST /upgrade prorates", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValue({
			stripeSubscriptionId: "sub_1",
			tier: "pro",
			update: jest.fn().mockResolvedValue(undefined),
		});
		mockList.mockResolvedValue({
			data: [
				{ id: "price_p", type: "recurring", metadata: { clara_tier: "pro" } },
				{ id: "price_m", type: "recurring", metadata: { clara_tier: "max" } },
			],
		});
		mockRetrieve.mockResolvedValue({ items: { data: [{ id: "si_1" }] } });
		mockSubUpdate.mockResolvedValue({});
		const r = await request(app).post("/billing/upgrade").send({ newTier: "max" });
		expect(r.status).toBe(200);
		expect(r.body.newTier).toBe("max");
		expect(mockSubUpdate).toHaveBeenCalledWith(
			"sub_1",
			expect.objectContaining({ proration_behavior: "always_invoice" }),
		);
	});

	it("POST /refund trialing cancels without refund", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValue({
			stripeSubscriptionId: "sub_1",
			stripeCustomerId: "cus_1",
			currentPeriodStart: new Date(),
			update: jest.fn().mockResolvedValue(undefined),
		});
		mockRetrieve.mockResolvedValue({ status: "trialing" });
		const r = await request(app).post("/billing/refund").send({});
		expect(r.status).toBe(200);
		expect(r.body.trial_ended).toBe(true);
		expect(mockSubCancel).toHaveBeenCalled();
	});
});
