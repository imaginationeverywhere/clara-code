import type { AgentPhase } from "@/types/agent";

export type OnboardingIntent = "build_a_product" | "run_my_business" | "both";

export function resolvePhaseFromIntent(intent: OnboardingIntent): AgentPhase | "both" {
	if (intent === "build_a_product") return "builder";
	if (intent === "run_my_business") return "runtime";
	return "both";
}

export const ONBOARDING_PHASE_QUESTION =
	"Are you here to build a product — like a website or app — or do you want " +
	"agents that run your business and talk to your customers?";

export function buildBothPhaseExplainer(currentTier: string): string {
	const t = currentTier.toLowerCase();
	const canBuildAgents = t === "business" || t === "enterprise" || t === "small_business" || t === "team";

	if (canBuildAgents) {
		return [
			"You're in good shape. Your plan supports both.",
			"First we'll build your platform — frontend, backend, and infrastructure agents.",
			"Once it's live, we'll build the agents that operate it: guest service, booking confirmation,",
			"host onboarding — whatever your platform needs to run 24/7.",
			"Let's start with the build team. What kind of platform?",
		].join(" ");
	}

	return [
		"To build the platform, your current plan works great — three agents can build almost any website.",
		"To ALSO have agents that run the platform and talk to your customers,",
		"you'll need the Small Business plan. That's where we build the operational layer.",
		"Want to start building the platform now and upgrade when it's ready to launch?",
	].join(" ");
}
