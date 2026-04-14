/**
 * Covers Stripe webhook branches with mocked Stripe SDK + DB.
 */
import type { Request, Response } from "express";
import { stripeWebhookHandler } from "@/routes/webhooks-stripe";

const mockConstructEvent = jest.fn();
const mockRetrieve = jest.fn();

jest.mock("stripe", () =>
	jest.fn().mockImplementation(() => ({
		webhooks: {
			constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
		},
		subscriptions: {
			retrieve: (...args: unknown[]) => mockRetrieve(...args),
		},
	})),
);

jest.mock("@/models/Subscription", () => ({
	Subscription: {
		findOrCreate: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		create: jest.fn(),
	},
}));

jest.mock("@/models/ApiKey", () => ({
	ApiKey: {
		create: jest.fn(),
		update: jest.fn(),
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn(), warn: jest.fn() },
}));

import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";

describe("stripeWebhookHandler events", () => {
	const origSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const origStripeKey = process.env.STRIPE_SECRET_KEY;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
		process.env.STRIPE_SECRET_KEY = "sk_test";
		process.env.STRIPE_PRICE_PRO = "price_pro";
		process.env.STRIPE_PRICE_BUSINESS = "price_bus";
	});

	afterEach(() => {
		process.env.STRIPE_WEBHOOK_SECRET = origSecret;
		process.env.STRIPE_SECRET_KEY = origStripeKey;
	});

	function makeReq(body: Buffer): Request {
		return {
			headers: { "stripe-signature": "sig_test" },
			body,
		} as unknown as Request;
	}

	function makeRes(): Response {
		return {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
			json: jest.fn(),
		} as unknown as Response;
	}

	it("processes checkout.session.completed", async () => {
		mockConstructEvent.mockReturnValue({
			type: "checkout.session.completed",
			data: {
				object: {
					metadata: { clerk_user_id: "user_a", tier: "pro" },
					subscription: "sub_1",
					customer: "cus_1",
				},
			},
		});
		mockRetrieve.mockResolvedValue({
			status: "active",
			current_period_start: Math.floor(Date.now() / 1000),
			current_period_end: Math.floor(Date.now() / 1000) + 1000,
		});
		const row = { update: jest.fn().mockResolvedValue(undefined) };
		(Subscription.findOrCreate as jest.Mock).mockResolvedValueOnce([row, true]);
		(ApiKey.create as jest.Mock).mockResolvedValueOnce({});

		const req = makeReq(Buffer.from("{}"));
		const res = makeRes();
		await stripeWebhookHandler(req, res);
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
		expect(ApiKey.create).toHaveBeenCalled();
	});

	it("processes customer.subscription.deleted", async () => {
		mockConstructEvent.mockReturnValue({
			type: "customer.subscription.deleted",
			data: {
				object: {
					metadata: { clerk_user_id: "user_b" },
				},
			},
		});
		(Subscription.update as jest.Mock).mockResolvedValueOnce([1]);
		(ApiKey.update as jest.Mock).mockResolvedValueOnce([1]);

		const req = makeReq(Buffer.from("{}"));
		const res = makeRes();
		await stripeWebhookHandler(req, res);
		expect(Subscription.update).toHaveBeenCalled();
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
	});

	it("processes customer.subscription.updated when tier changes", async () => {
		mockConstructEvent.mockReturnValue({
			type: "customer.subscription.updated",
			data: {
				object: {
					id: "sub_x",
					metadata: { clerk_user_id: "user_c" },
					customer: "cus_c",
					status: "active",
					items: { data: [{ price: { id: "price_pro" } }] },
					current_period_start: Math.floor(Date.now() / 1000),
					current_period_end: Math.floor(Date.now() / 1000) + 1000,
				},
			},
		});
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce({
			tier: "business",
			update: jest.fn().mockResolvedValue(undefined),
		});
		(ApiKey.create as jest.Mock).mockResolvedValueOnce({});

		const res = makeRes();
		await stripeWebhookHandler(makeReq(Buffer.from("{}")), res);
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
		expect(ApiKey.create).toHaveBeenCalled();
	});
});
