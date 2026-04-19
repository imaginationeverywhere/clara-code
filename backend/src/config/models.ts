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

function resolveInferenceBackend(name: ClaraModelName): string {
	const voice = process.env.CLARA_VOICE_URL?.trim() ?? "";
	switch (name) {
		case "maya":
			return (process.env.MAYA_BACKEND_URL ?? "").trim() || voice;
		case "mary":
			return (process.env.MARY_BACKEND_URL ?? "").trim() || (process.env.MAYA_BACKEND_URL ?? "").trim() || voice;
		case "nikki":
			return (process.env.NIKKI_BACKEND_URL ?? "").trim() || (process.env.MAYA_BACKEND_URL ?? "").trim() || voice;
		default:
			return voice;
	}
}

export const MODELS: Record<ClaraModelName, ModelConfig> = {
	maya: {
		name: "maya",
		displayName: "Maya",
		inferenceBackend: "",
		thinking: false,
		requiredTier: "free",
	},
	mary: {
		name: "mary",
		displayName: "Mary",
		inferenceBackend: "",
		thinking: true,
		requiredTier: "pro",
	},
	nikki: {
		name: "nikki",
		displayName: "Nikki",
		inferenceBackend: "",
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
	const inferenceBackend = resolveInferenceBackend(model.name);
	if (!inferenceBackend) {
		throw new Error(`Clara voice service is not configured (${modelName})`);
	}
	return { ...model, inferenceBackend };
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
