/**
 * Covers Stripe webhook branches with mocked Stripe SDK + DB.
 */
import type { Request, Response } from "express";
import { stripeWebhookHandler } from "@/routes/webhooks-stripe";

const mockConstructEvent = jest.fn();
const mockRetrieve = jest.fn();
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
		subscriptions: {
			retrieve: (...args: unknown[]) => mockRetrieve(...args),
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

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { getTalentRegistryService } from "@/features/talent-registry/talent-registry-instance";
import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";

describe("stripeWebhookHandler events", () => {
	const origSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const origStripeKey = process.env.STRIPE_SECRET_KEY;

	beforeEach(() => {
		jest.clearAllMocks();
		const tr = getTalentRegistryService() as unknown as {
			activateDeveloperProgram: jest.Mock;
			cancelDeveloperProgram: jest.Mock;
		};
		tr.activateDeveloperProgram.mockResolvedValue(undefined);
		tr.cancelDeveloperProgram.mockResolvedValue(undefined);
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

	it("checkout.session.completed activates Developer Program when metadata.type is developer_program", async () => {
		mockConstructEvent.mockReturnValue({
			type: "checkout.session.completed",
			data: {
				object: {
					metadata: { type: "developer_program", userId: "user_dev" },
					subscription: "sub_dev",
					customer: "cus_1",
				},
			},
		});
		const req = makeReq(Buffer.from("{}"));
		const res = makeRes();
		await stripeWebhookHandler(req, res);
		const tr = getTalentRegistryService() as unknown as {
			activateDeveloperProgram: jest.Mock;
			cancelDeveloperProgram: jest.Mock;
		};
		expect(tr.activateDeveloperProgram).toHaveBeenCalledWith("user_dev", "sub_dev");
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
	});

	it("customer.subscription.deleted cancels Developer Program when metadata.type is developer_program", async () => {
		mockConstructEvent.mockReturnValue({
			type: "customer.subscription.deleted",
			data: {
				object: {
					id: "sub_dev",
					metadata: { type: "developer_program", userId: "user_dev" },
				},
			},
		});
		const req = makeReq(Buffer.from("{}"));
		const res = makeRes();
		await stripeWebhookHandler(req, res);
		const tr2 = getTalentRegistryService() as unknown as {
			activateDeveloperProgram: jest.Mock;
			cancelDeveloperProgram: jest.Mock;
		};
		expect(tr2.cancelDeveloperProgram).toHaveBeenCalledWith("sub_dev");
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
	});

	it("checkout.session.completed developer_program does not activate when subscription id is missing", async () => {
		mockConstructEvent.mockReturnValue({
			type: "checkout.session.completed",
			data: {
				object: {
					metadata: { type: "developer_program", userId: "user_dev" },
					subscription: null,
					customer: "cus_1",
				},
			},
		});
		const req = makeReq(Buffer.from("{}"));
		const res = makeRes();
		await stripeWebhookHandler(req, res);
		const tr = getTalentRegistryService() as unknown as { activateDeveloperProgram: jest.Mock };
		expect(tr.activateDeveloperProgram).not.toHaveBeenCalled();
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ received: true });
	});

	it("processes customer.subscription.updated when tier changes", async () => {
		mockConstructEvent.mockReturnValue({
			type: "customer.subscription.updated",
			data: {
				object: {
					id: "sub_x",
					metadata: { clerk_user_id: "user_c", tier: "pro" },
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
