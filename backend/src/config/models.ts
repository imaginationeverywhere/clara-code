export type ClaraModelName = "mary" | "maya" | "nikki";

export type ClaraTier = "free" | "pro" | "business";

export interface ModelConfig {
	name: ClaraModelName;
	displayName: string;
	/** Internal routing base URL — never exposed in public API responses */
	inferenceBackend: string;
	thinking: boolean;
	/** Minimum tier rank required (pro = Pro or Business) */
	requiredTier: ClaraTier;
}

const VOICE_FALLBACK = process.env.CLARA_VOICE_URL ?? "";

export const MODELS: Record<ClaraModelName, ModelConfig> = {
	maya: {
		name: "maya",
		displayName: "Maya",
		inferenceBackend: process.env.MAYA_BACKEND_URL || VOICE_FALLBACK,
		thinking: false,
		requiredTier: "free",
	},
	mary: {
		name: "mary",
		displayName: "Mary",
		inferenceBackend: process.env.MARY_BACKEND_URL || process.env.MAYA_BACKEND_URL || VOICE_FALLBACK,
		thinking: true,
		requiredTier: "pro",
	},
	nikki: {
		name: "nikki",
		displayName: "Nikki",
		inferenceBackend: process.env.NIKKI_BACKEND_URL || process.env.MAYA_BACKEND_URL || VOICE_FALLBACK,
		thinking: false,
		requiredTier: "pro",
	},
};

export const DEFAULT_MODEL: ClaraModelName = "maya";

const TIER_RANK: Record<ClaraTier, number> = { free: 0, pro: 1, business: 2 };

export function resolveModel(requested: string | undefined, tier: ClaraTier): ModelConfig {
	const raw = requested ?? DEFAULT_MODEL;
	const modelName = raw as ClaraModelName;
	const model = MODELS[modelName];
	if (!model) {
		return MODELS[DEFAULT_MODEL];
	}

	if (TIER_RANK[tier] < TIER_RANK[model.requiredTier]) {
		throw new ModelTierError(modelName, model.requiredTier, tier);
	}
	if (!model.inferenceBackend) {
		throw new Error(`Clara voice service is not configured (${modelName})`);
	}
	return model;
}

export class ModelTierError extends Error {
	constructor(
		public readonly model: ClaraModelName,
		public readonly requiredTier: string,
		public readonly userTier: string,
	) {
		super(`Model "${model}" requires ${requiredTier} tier (current: ${userTier})`);
		this.name = "ModelTierError";
	}
}

function pricingUrl(): string {
	if (process.env.FRONTEND_URL) {
		return `${process.env.FRONTEND_URL.replace(/\/$/, "")}/pricing`;
	}
	return "https://claracode.ai/pricing";
}

export function modelTierErrorResponse(err: ModelTierError): Record<string, unknown> {
	return {
		error: "model_tier_required",
		message: `Model "${err.model}" requires a Pro subscription.`,
		model: err.model,
		required_tier: "pro",
		current_tier: err.userTier,
		upgrade_url: pricingUrl(),
	};
}
