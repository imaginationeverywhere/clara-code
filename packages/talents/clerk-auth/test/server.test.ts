import type { ApolloServer } from "@apollo/server";
import type { Application } from "express";
import request from "supertest";
import { createClerkAuthApp } from "../src/create-app";

describe("clerk-auth server", () => {
	const token = "test-service-token-abc123";
	let app: Application;
	let server: ApolloServer;

	beforeAll(async () => {
		process.env.CLARA_SERVICE_TOKEN = token;
		const created = await createClerkAuthApp();
		app = created.app;
		server = created.server;
	});

	afterAll(async () => {
		await server.stop();
		delete process.env.CLARA_SERVICE_TOKEN;
	});

	it("returns auth status when the service token is valid", async () => {
		const res = await request(app)
			.post("/graphql")
			.set("x-clara-service-token", token)
			.send({ query: "{ authStatus { gatewayVerified timestamp } }" });

		expect(res.status).toBe(200);
		expect(res.body.errors).toBeUndefined();
		expect(res.body.data.authStatus.gatewayVerified).toBe(true);
	});

	it("rejects requests without a valid service token", async () => {
		const res = await request(app)
			.post("/graphql")
			.set("x-clara-service-token", "nope")
			.send({ query: "{ authStatus { gatewayVerified } }" });

		expect(res.body.errors?.[0]?.message).toMatch(/Unauthorized/);
	});

	it("verifies a token via verifyToken", async () => {
		const res = await request(app)
			.post("/graphql")
			.set("x-clara-service-token", token)
			.send({
				query: `query { verifyToken(token: "${token}") { valid message } }`,
			});

		expect(res.status).toBe(200);
		expect(res.body.errors).toBeUndefined();
		expect(res.body.data.verifyToken.valid).toBe(true);
	});
});
