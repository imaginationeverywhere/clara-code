import type { ApolloServer } from "@apollo/server";
import type { Application } from "express";
import request from "supertest";
import { createGatewayConnectApp } from "../src/create-app";

describe("gateway-connect server", () => {
	const token = "test-service-token-abc123";
	let app: Application;
	let server: ApolloServer;

	beforeAll(async () => {
		process.env.CLARA_SERVICE_TOKEN = token;
		const created = await createGatewayConnectApp();
		app = created.app;
		server = created.server;
	});

	afterAll(async () => {
		await server.stop();
		delete process.env.CLARA_SERVICE_TOKEN;
	});

	it("returns gateway health with a valid service token", async () => {
		const res = await request(app)
			.post("/graphql")
			.set("x-clara-service-token", token)
			.send({ query: "{ gatewayHealth { status version } }" });

		expect(res.status).toBe(200);
		expect(res.body.errors).toBeUndefined();
		expect(res.body.data.gatewayHealth.status).toBe("ok");
	});

	it("rejects requests without a valid service token", async () => {
		const res = await request(app)
			.post("/graphql")
			.set("x-clara-service-token", "invalid")
			.send({ query: "{ gatewayHealth { status } }" });

		expect(res.body.errors?.[0]?.message).toMatch(/Unauthorized/);
	});

	it("returns session info from Clara context headers", async () => {
		const res = await request(app)
			.post("/graphql")
			.set("x-clara-service-token", token)
			.set("x-clara-session-token", "sess-1")
			.set("x-clara-voice-command", "check clara status")
			.set("x-clara-requested-at", "2026-04-14T12:00:00.000Z")
			.send({ query: "{ sessionInfo { sessionToken voiceCommand requestedAt } }" });

		expect(res.status).toBe(200);
		expect(res.body.errors).toBeUndefined();
		expect(res.body.data.sessionInfo).toEqual({
			sessionToken: "sess-1",
			voiceCommand: "check clara status",
			requestedAt: "2026-04-14T12:00:00.000Z",
		});
	});
});
