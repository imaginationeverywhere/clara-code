import type { Request, Response } from "express";
import express from "express";
import request from "supertest";

jest.mock("@/routes/keys", () => {
	const { Router } = require("express");
	const r = Router();
	r.get("/", (_req: Request, res: Response) => res.json({ route: "keys" }));
	return r;
});
jest.mock("@/routes/waitlist", () => {
	const { Router } = require("express");
	const r = Router();
	r.get("/", (_req: Request, res: Response) => res.json({ route: "waitlist" }));
	return r;
});
jest.mock("@/routes/models", () => {
	const { Router } = require("express");
	const r = Router();
	r.get("/", (_req: Request, res: Response) => res.json({ route: "models" }));
	return r;
});
jest.mock("@/routes/voice", () => {
	const { Router } = require("express");
	const r = Router();
	r.get("/", (_req: Request, res: Response) => res.json({ route: "voice" }));
	return r;
});

import apiRoutes from "@/routes/index";

const app = express();
app.use("/api", apiRoutes);

describe("routes index", () => {
	it("mounts keys, models, waitlist, voice", async () => {
		expect((await request(app).get("/api/keys/")).body.route).toBe("keys");
		expect((await request(app).get("/api/models/")).body.route).toBe("models");
		expect((await request(app).get("/api/waitlist/")).body.route).toBe("waitlist");
		expect((await request(app).get("/api/voice/")).body.route).toBe("voice");
	});
});
