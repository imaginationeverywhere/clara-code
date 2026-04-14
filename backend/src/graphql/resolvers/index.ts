import type { Request } from "express";
import { ApiKey } from "@/models/ApiKey";
import { User } from "@/models/User";
import { WaitlistEntry } from "@/models/WaitlistEntry";

export interface GraphQLContext {
	req: Request;
	auth: { userId: string | null };
}

export const resolvers = {
	WaitlistEntry: {
		createdAt: (parent: WaitlistEntry) => parent.createdAt.toISOString(),
	},
	Query: {
		health: () => "ok",
		me: async (_p: unknown, _a: unknown, ctx: GraphQLContext) => {
			const userId = ctx.auth.userId;
			if (!userId) return null;
			const user = await User.findOne({ where: { clerkId: userId } });
			if (user) {
				return {
					id: user.id,
					clerkId: userId,
					email: user.email ?? "",
					firstName: user.firstName,
					lastName: user.lastName,
					createdAt: user.createdAt.toISOString(),
				};
			}
			return {
				id: userId,
				clerkId: userId,
				email: "",
				firstName: null,
				lastName: null,
				createdAt: new Date().toISOString(),
			};
		},
		myApiKeys: async (_p: unknown, _a: unknown, ctx: GraphQLContext) => {
			const userId = ctx.auth.userId;
			if (!userId) return [];
			const keys = await ApiKey.findAll({ where: { userId, isActive: true } });
			return keys.map((k: ApiKey) => ({
				id: k.id,
				name: k.name,
				keyPreview: k.key ? `sk-clara-...${k.key.slice(-4)}` : k.keyPrefix ? `${k.keyPrefix}...` : "—",
				lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
				createdAt: k.createdAt.toISOString(),
			}));
		},
	},
	Mutation: {
		joinWaitlist: async (_p: unknown, args: { email: string; name?: string; role?: string }) => {
			const { email, name, role } = args;
			const [entry] = await WaitlistEntry.findOrCreate({
				where: { email: email.toLowerCase().trim() },
				defaults: {
					email: email.toLowerCase().trim(),
					name: name ?? null,
					role: role ?? null,
				},
			});
			return entry;
		},
		createApiKey: async (_p: unknown, args: { name: string }, ctx: GraphQLContext) => {
			const userId = ctx.auth.userId;
			if (!userId) throw new Error("Unauthorized");
			const key = await ApiKey.create({ userId, name: args.name });
			return key.key;
		},
		revokeApiKey: async (_p: unknown, args: { id: string }, ctx: GraphQLContext) => {
			const userId = ctx.auth.userId;
			if (!userId) throw new Error("Unauthorized");
			const key = await ApiKey.findOne({ where: { id: args.id, userId } });
			if (!key) throw new Error("Key not found");
			await key.update({ isActive: false });
			return true;
		},
	},
};
