/**
 * Tier resolution for customer.subscription.updated (metadata vs price lookup).
 */
import type { Request, Response } from "express";
import { stripeWebhookHandler } from "@/routes/webhooks-stripe";

const mockConstructEvent = jest.fn();
const mockPriceRetrieve = jest.fn();

jest.mock("@/features/talent-registry/talent-registry-instance", () => {
	const talentRegistrySvc = {
		activateDeveloperProgram: jest.fn().mockResolvedValue(undefined),
		cancelDeveloperProgram: jest.fn().mockResolvedValue(undefined),
	};
	return {
		getTalentRegistryService: jest.fn(() => talentRegistrySvc),
	};
});

jest.mock("stripe", () =>
	jest.fn().mockImplementation(() => ({
		webhooks: {
			constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
		},
		prices: {
			retrieve: (...args: unknown[]) => mockPriceRetrieve(...args),
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

const mockWarn = jest.fn();
jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn(), warn: (...args: unknown[]) => mockWarn(...args), info: jest.fn() },
}));

import { Subscription } from "@/models/Subscription";

describe("customer.subscription.updated tier resolution", () => {
	const origSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const origStripeKey = process.env.STRIPE_SECRET_KEY;

	beforeEach(() => {
		jest.clearAllMocks();
		mockWarn.mockReset();
		process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
		process.env.STRIPE_SECRET_KEY = "sk_test";
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

	it("resolves tier from subscription metadata without calling stripe.prices.retrieve", async () => {
		mockConstructEvent.mockReturnValue({
			type: "customer.subscription.updated",
			data: {
				object: {
					id: "sub_meta",
					metadata: { clerk_user_id: "user_meta", tier: "pro" },
					customer: "cus_1",
					status: "active",
					items: { data: [{ price: { id: "price_any" } }] },
					current_period_start: Math.floor(Date.now() / 1000),
					current_period_end: Math.floor(Date.now() / 1000) + 1000,
				},
			},
		});
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce({
			tier: "free",
			update: jest.fn().mockResolvedValue(undefined),
		});

		const res = makeRes();
		await stripeWebhookHandler(makeReq(Buffer.from("{}")), res);
		expect(mockPriceRetrieve).not.toHaveBeenCalled();
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
	});

	it("falls back to stripe.prices.retrieve when tier not in subscription metadata", async () => {
		mockPriceRetrieve.mockResolvedValue({
			id: "price_fb",
			metadata: { clara_tier: "business" },
		});
		mockConstructEvent.mockReturnValue({
			type: "customer.subscription.updated",
			data: {
				object: {
					id: "sub_fb",
					metadata: { clerk_user_id: "user_fb" },
					customer: "cus_2",
					status: "active",
					items: { data: [{ price: { id: "price_fb" } }] },
					current_period_start: Math.floor(Date.now() / 1000),
					current_period_end: Math.floor(Date.now() / 1000) + 1000,
				},
			},
		});
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce({
			tier: "pro",
			update: jest.fn().mockResolvedValue(undefined),
		});

		const res = makeRes();
		await stripeWebhookHandler(makeReq(Buffer.from("{}")), res);
		expect(mockPriceRetrieve).toHaveBeenCalledWith("price_fb");
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
	});

	it("skips when tier cannot be resolved", async () => {
		mockPriceRetrieve.mockResolvedValue({
			id: "price_x",
			metadata: {},
		});
		mockConstructEvent.mockReturnValue({
			type: "customer.subscription.updated",
			data: {
				object: {
					id: "sub_skip",
					metadata: { clerk_user_id: "user_skip" },
					customer: "cus_3",
					status: "active",
					items: { data: [{ price: { id: "price_x" } }] },
					current_period_start: Math.floor(Date.now() / 1000),
					current_period_end: Math.floor(Date.now() / 1000) + 1000,
				},
			},
		});

		const res = makeRes();
		await stripeWebhookHandler(makeReq(Buffer.from("{}")), res);
		expect(mockWarn).toHaveBeenCalledWith("customer.subscription.updated: cannot resolve tier, skipping");
		expect((Subscription.findOne as jest.Mock).mock.calls.length).toBe(0);
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
	});
});
