jest.mock("@/models/User", () => ({
	User: {
		findOne: jest.fn(),
	},
}));
jest.mock("@/models/ApiKey", () => ({
	ApiKey: {
		findAll: jest.fn(),
		create: jest.fn(),
		findOne: jest.fn(),
	},
}));
jest.mock("@/models/WaitlistEntry", () => ({
	WaitlistEntry: {
		findOrCreate: jest.fn(),
	},
}));

import { resolvers } from "@/graphql/resolvers/index";
import { ApiKey } from "@/models/ApiKey";
import { User } from "@/models/User";
import { WaitlistEntry } from "@/models/WaitlistEntry";

describe("GraphQL resolvers", () => {
	const baseCtx = { req: {} as import("express").Request, auth: { userId: null as string | null } };

	it("Query.health returns ok", () => {
		expect(resolvers.Query.health()).toBe("ok");
	});

	it("Query.me returns null without userId", async () => {
		const r = await resolvers.Query.me(null, {}, { ...baseCtx, auth: { userId: null } });
		expect(r).toBeNull();
	});

	it("Query.me returns user from DB when found", async () => {
		const created = new Date("2020-01-01T00:00:00.000Z");
		(User.findOne as jest.Mock).mockResolvedValueOnce({
			id: "uid",
			email: "a@b.com",
			firstName: "A",
			lastName: "B",
			createdAt: created,
		});
		const r = await resolvers.Query.me(null, {}, { ...baseCtx, auth: { userId: "user_1" } });
		expect(r).toMatchObject({
			clerkId: "user_1",
			email: "a@b.com",
			firstName: "A",
			lastName: "B",
		});
	});

	it("Query.me returns stub when user not in DB", async () => {
		(User.findOne as jest.Mock).mockResolvedValueOnce(null);
		const r = await resolvers.Query.me(null, {}, { ...baseCtx, auth: { userId: "user_ghost" } });
		expect(r).toMatchObject({ clerkId: "user_ghost", email: "" });
	});

	it("Query.myApiKeys returns empty without userId", async () => {
		const r = await resolvers.Query.myApiKeys(null, {}, { ...baseCtx, auth: { userId: null } });
		expect(r).toEqual([]);
	});

	it("Query.myApiKeys maps keys", async () => {
		const created = new Date("2020-01-01T00:00:00.000Z");
		(ApiKey.findAll as jest.Mock).mockResolvedValueOnce([
			{
				id: "k1",
				name: "n",
				key: "sk-clara-" + "a".repeat(48),
				lastUsedAt: null,
				createdAt: created,
			},
		]);
		const r = await resolvers.Query.myApiKeys(null, {}, { ...baseCtx, auth: { userId: "user_1" } });
		expect(r).toHaveLength(1);
		expect(r[0].keyPreview).toMatch(/^sk-clara-\.\.\./);
	});

	it("WaitlistEntry.createdAt serializes", () => {
		const d = new Date("2020-01-01T00:00:00.000Z");
		const out = resolvers.WaitlistEntry.createdAt({ createdAt: d } as import("@/models/WaitlistEntry").WaitlistEntry);
		expect(out).toBe(d.toISOString());
	});

	it("Mutation.joinWaitlist findOrCreate", async () => {
		const entry = { id: "w1" };
		(WaitlistEntry.findOrCreate as jest.Mock).mockResolvedValueOnce([entry, true]);
		const r = await resolvers.Mutation.joinWaitlist(null, { email: "X@Y.COM" });
		expect(r).toBe(entry);
	});

	it("Mutation.createApiKey throws when unauthenticated", async () => {
		await expect(resolvers.Mutation.createApiKey(null, { name: "n" }, { ...baseCtx, auth: { userId: null } })).rejects.toThrow(
			"Unauthorized",
		);
	});

	it("Mutation.createApiKey creates key", async () => {
		(ApiKey.create as jest.Mock).mockResolvedValueOnce({ key: "sk-clara-abc" });
		const k = await resolvers.Mutation.createApiKey(null, { name: "n" }, { ...baseCtx, auth: { userId: "user_1" } });
		expect(k).toBe("sk-clara-abc");
	});

	it("Mutation.revokeApiKey throws when unauthenticated", async () => {
		await expect(resolvers.Mutation.revokeApiKey(null, { id: "x" }, { ...baseCtx, auth: { userId: null } })).rejects.toThrow(
			"Unauthorized",
		);
	});

	it("Mutation.revokeApiKey throws when key missing", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce(null);
		await expect(
			resolvers.Mutation.revokeApiKey(null, { id: "x" }, { ...baseCtx, auth: { userId: "user_1" } }),
		).rejects.toThrow("Key not found");
	});

	it("Mutation.revokeApiKey revokes", async () => {
		const key = { update: jest.fn().mockResolvedValue(undefined) };
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce(key);
		const ok = await resolvers.Mutation.revokeApiKey(null, { id: "x" }, { ...baseCtx, auth: { userId: "user_1" } });
		expect(ok).toBe(true);
		expect(key.update).toHaveBeenCalledWith({ isActive: false });
	});
});
