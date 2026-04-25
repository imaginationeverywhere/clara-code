import type { AgentPhase } from "@/types/agent";

export const DEFAULT_BUILDER_SKILLS: string[] = ["react", "nodejs", "postgresql", "typescript", "stripe-connect"];

export const DEFAULT_RUNTIME_SKILLS: string[] = [
	"voice-persona-design",
	"conversation-flow-design",
	"voice-audio-patterns",
	"memory-configuration",
];

export const DUAL_INTERPRETATION_SKILLS: string[] = [
	"rental",
	"barbershop",
	"delivery",
	"fintech",
	"restaurant",
	"healthcare",
	"legal",
	"fitness",
	"real-estate",
	"ecommerce",
];

export function getPhaseContextPrefix(phase: AgentPhase): string {
	if (phase === "builder") {
		return [
			"[AGENT PHASE: BUILDER]",
			"You are a development agent. When you apply industry vertical skills,",
			"interpret them as CODE PATTERNS: data models, API flows, payment logic,",
			"UI components, and integration architecture.",
			"You write code, not conversations.",
		].join(" ");
	}

	return [
		"[AGENT PHASE: RUNTIME]",
		"You are an operational agent deployed inside a live product.",
		"When you apply industry vertical skills, interpret them as CONVERSATION PATTERNS:",
		"how to talk to customers, how to handle requests, how to explain policies.",
		"You speak to end users, not to developers.",
	].join(" ");
}

const BUILDER_ONLY_SKILLS = new Set([
	"ci-cd",
	"docker",
	"kubernetes",
	"terraform",
	"aws-infrastructure",
	"database-migrations",
	"graphql-schema-design",
]);

const RUNTIME_ONLY_SKILLS = new Set([
	"voice-persona-design",
	"conversation-flow-design",
	"voice-audio-patterns",
	"agent-skill-selection",
]);

export function skillCompatibleWithPhase(skill: string, phase: AgentPhase): boolean {
	if (phase === "runtime" && BUILDER_ONLY_SKILLS.has(skill)) return false;
	if (phase === "builder" && RUNTIME_ONLY_SKILLS.has(skill)) return false;
	return true;
}

/** @deprecated use skillCompatibleWithPhase */
export const isSkillCompatible = skillCompatibleWithPhase;

export class AgentPhaseService {
	getDefaultSkills(phase: AgentPhase): string[] {
		return phase === "builder" ? [...DEFAULT_BUILDER_SKILLS] : [...DEFAULT_RUNTIME_SKILLS];
	}

	buildPhaseContext(phase: AgentPhase, industryVertical?: string): string {
		const prefix = getPhaseContextPrefix(phase);
		if (!industryVertical) return prefix;

		const verticalNote =
			phase === "builder"
				? `\nFor the ${industryVertical} industry: apply code patterns, data models, and integration flows.`
				: `\nFor the ${industryVertical} industry: apply conversation patterns, customer scripts, and operational knowledge.`;

		return prefix + verticalNote;
	}

	canCreateRuntimeAgent(canBuildAgents: boolean): boolean {
		return canBuildAgents;
	}

	isSkillCompatible(skill: string, phase: AgentPhase): boolean {
		return skillCompatibleWithPhase(skill, phase);
	}
}

export const agentPhaseService = new AgentPhaseService();
