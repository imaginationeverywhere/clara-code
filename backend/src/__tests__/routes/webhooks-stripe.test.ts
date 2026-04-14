import type { Request, Response } from "express";
import { stripeWebhookHandler } from "@/routes/webhooks-stripe";

jest.mock("stripe", () =>
	jest.fn().mockImplementation(() => ({
		webhooks: {
			constructEvent: jest.fn().mockImplementation(() => {
				throw new Error("bad sig");
			}),
		},
	})),
);

describe("stripeWebhookHandler", () => {
	const origSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const origStripe = process.env.STRIPE_SECRET_KEY;

	afterEach(() => {
		process.env.STRIPE_WEBHOOK_SECRET = origSecret;
		process.env.STRIPE_SECRET_KEY = origStripe;
	});

	it("503 when STRIPE_WEBHOOK_SECRET missing", async () => {
		delete process.env.STRIPE_WEBHOOK_SECRET;
		const req = {} as Request;
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
			json: jest.fn(),
		} as unknown as Response;
		await stripeWebhookHandler(req, res);
		expect((res.status as jest.Mock).mock.calls[0][0]).toBe(503);
	});

	it("400 when stripe-signature header missing", async () => {
		process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
		const req = { headers: {}, body: Buffer.from("{}") } as unknown as Request;
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
			json: jest.fn(),
		} as unknown as Response;
		await stripeWebhookHandler(req, res);
		expect((res.status as jest.Mock).mock.calls[0][0]).toBe(400);
	});

	it("400 when signature verification fails", async () => {
		process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
		process.env.STRIPE_SECRET_KEY = "sk_test";
		const req = {
			headers: { "stripe-signature": "bad" },
			body: Buffer.from("{}"),
		} as unknown as Request;
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
			json: jest.fn(),
		} as unknown as Response;
		await stripeWebhookHandler(req, res);
		expect((res.status as jest.Mock).mock.calls[0][0]).toBe(400);
	});
});
