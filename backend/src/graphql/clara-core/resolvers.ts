import { GraphQLError } from "graphql";

import {
	type ClaraModelName,
	type ClaraTier,
	MODELS,
	type ModelConfig,
	ModelTierError,
	resolveModel,
} from "@/config/models";
import type { ClaraCoreContext } from "@/graphql/clara-core/context";
import { Agent } from "@/models/Agent";
import { type VoiceTier, voiceUsageService } from "@/services/voice-usage.service";

const GATEWAY_BASE = (process.env.CLARA_GATEWAY_URL || "https://api.claracode.ai").replace(/\/$/, "");

const TIER_RANK: Record<ClaraTier, number> = { free: 0, pro: 1, business: 2 };

function modelEnumToInternal(name: string | undefined): ClaraModelName | undefined {
	if (!name) return undefined;
	const lower = name.toLowerCase();
	if (lower === "mary" || lower === "maya" || lower === "nikki") {
		return lower;
	}
	return undefined;
}

export const resolvers = {
	Query: {
		me: async (_: unknown, __: unknown, ctx: ClaraCoreContext) => {
			const tier = ctx.user.tier as VoiceTier;
			const { used, limit } = await voiceUsageService.getUsage(ctx.user.userId, tier);
			return {
				id: ctx.user.userId,
				tier: ctx.user.tier,
				voiceExchangesUsed: used,
				voiceExchangesLimit: limit,
			};
		},

		models: (_: unknown, __: unknown, ctx: ClaraCoreContext) => {
			const userRank = TIER_RANK[ctx.user.tier as ClaraTier] ?? 0;
			return Object.values(MODELS)
				.filter((m) => TIER_RANK[m.requiredTier] <= userRank)
				.map((m) => ({
					name: m.name.toUpperCase(),
					displayName: m.displayName,
					thinking: m.thinking,
				}));
		},

		agents: async (_: unknown, __: unknown, ctx: ClaraCoreContext) => {
			const rows = await Agent.findAll({
				where: { userId: ctx.user.userId },
				order: [["createdAt", "DESC"]],
			});
			return rows.map((r) => ({ id: r.id, name: r.name }));
		},
	},

	Mutation: {
		ask: async (_: unknown, args: { prompt: string; model?: string }, ctx: ClaraCoreContext) => {
			let model: ModelConfig;
			try {
				model = resolveModel(modelEnumToInternal(args.model), ctx.user.tier as ClaraTier);
			} catch (error) {
				if (error instanceof ModelTierError) {
					throw new GraphQLError(error.message, { extensions: { code: "FORBIDDEN" } });
				}
				throw error;
			}
			const response = await fetch(`${GATEWAY_BASE}/v1/ask`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(ctx.authorization ? { Authorization: ctx.authorization } : {}),
				},
				body: JSON.stringify({ prompt: args.prompt, model: model.name }),
			});
			if (!response.ok) {
				throw new GraphQLError(`Clara API request failed (${String(response.status)})`);
			}
			const data = (await response.json()) as { message?: { content?: string }; voiceUrl?: string | null };
			return {
				role: "assistant",
				content: data.message?.content ?? "",
				voiceUrl: data.voiceUrl ?? null,
			};
		},

		startVoiceSession: async (_: unknown, __: unknown, ctx: ClaraCoreContext) => {
			const response = await fetch(`${GATEWAY_BASE}/v1/voice/sessions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(ctx.authorization ? { Authorization: ctx.authorization } : {}),
				},
				body: JSON.stringify({}),
			});
			if (!response.ok) {
				throw new GraphQLError(`Clara voice session failed (${String(response.status)})`);
			}
			const data = (await response.json()) as { id?: unknown };
			if (typeof data.id !== "string" || data.id.length === 0) {
				throw new GraphQLError("Clara voice session response missing id");
			}
			return { id: data.id };
		},

		createAgent: async (_: unknown, args: { name: string; soul: string }, ctx: ClaraCoreContext) => {
			const row = await Agent.create({
				userId: ctx.user.userId,
				name: args.name,
				soul: args.soul,
				slotIndex: 0,
				role: "frontend",
				voiceId: null,
				modelTier: "fast",
				isActive: true,
				phase: "builder",
				industryVertical: null,
			});
			return { id: row.id, name: row.name };
		},
	},

	Subscription: {
		stream: {
			subscribe: async function* (_p: unknown, _a: unknown) {
				yield { text: "", done: true };
			},
		},
	},
};
