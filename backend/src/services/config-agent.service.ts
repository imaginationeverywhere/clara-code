import { col, fn, Op, where as sqlWhere } from "sequelize";
import { AgentTemplate, type SuggestedSkill } from "@/models/AgentTemplate";
import { UserAgent } from "@/models/UserAgent";
import { PLAN_LIMITS, type PlanTier } from "@/services/plan-limits";
import { voiceCloneService } from "@/services/voice-clone.service";
import { logger } from "@/utils/logger";

type AgentTemplateInstance = InstanceType<typeof AgentTemplate>;

export interface ConfigureAgentInput {
	userId: string;
	tier: PlanTier;
	templateId: string;
	name: string;
	voice: { source: "library"; voiceId: string } | { source: "clone"; audioBase64: string };
	skillIds: string[];
	personalityTweaks?: Record<string, string>;
}

function normalizeSkillIds(template: AgentTemplateInstance, skillIds: string[]): Array<{ id: string; name: string }> {
	if (skillIds.length === 0) return [];
	const byId = new Map((template.suggestedSkills ?? ([] as SuggestedSkill[])).map((s) => [s.id, s] as const));
	return skillIds.map((id) => {
		const row = byId.get(id);
		return row ? { id: row.id, name: row.name } : { id, name: id };
	});
}

export class ConfigAgentService {
	async configure(input: ConfigureAgentInput): Promise<UserAgent> {
		const limits = PLAN_LIMITS[input.tier];

		const existing = await UserAgent.count({
			where: { userId: input.userId, isActive: true },
		});
		const cap = limits.configurableAgents;
		if (cap !== null && existing >= cap) {
			throw new Error(`harness_limit_reached:${String(cap)}`);
		}

		if (limits.talentsPerAgent !== null && input.skillIds.length > limits.talentsPerAgent) {
			throw new Error(`talents_per_agent_exceeded:${limits.talentsPerAgent}`);
		}

		const template = await AgentTemplate.findByPk(input.templateId);
		if (!template) throw new Error(`unknown_template:${input.templateId}`);

		let voiceId: string;
		if (input.voice.source === "clone") {
			voiceId = await voiceCloneService.cloneFromSample(input.userId, input.voice.audioBase64);
		} else {
			voiceId = input.voice.voiceId;
		}

		const skillPayload = normalizeSkillIds(template, input.skillIds);
		const soulMd = this.composeSoulMd(template, input.name, input.personalityTweaks);

		const nameTrim = input.name.trim();
		if (nameTrim.length === 0) {
			throw new Error("name_required");
		}
		const existingName = await UserAgent.findOne({
			where: {
				userId: input.userId,
				isActive: true,
				[Op.and]: [sqlWhere(fn("LOWER", col("name")), nameTrim.toLowerCase())],
			},
		});
		if (existingName) {
			throw new Error("duplicate_agent_name");
		}

		const agent = await UserAgent.create({
			userId: input.userId,
			templateId: input.templateId,
			name: nameTrim,
			voiceId,
			attachedSkills: skillPayload,
			personalityTweaks: input.personalityTweaks ?? {},
			soulMd,
			isActive: true,
		});

		logger.info("user_agent_configured", {
			userId: input.userId,
			agentId: agent.id,
			templateId: input.templateId,
			name: input.name,
		});
		return agent;
	}

	private composeSoulMd(template: AgentTemplateInstance, agentName: string, tweaks?: Record<string, string>): string {
		let soul = template.soulMdTemplate.replace(/\{AGENT_NAME\}/g, agentName);
		if (tweaks) {
			for (const [k, v] of Object.entries(tweaks)) {
				soul = soul.replace(new RegExp(`\\{TWEAK_${k.toUpperCase()}\\}`, "g"), v);
			}
		}
		return soul;
	}

	async retireAgent(userId: string, agentId: string): Promise<void> {
		const agent = await UserAgent.findOne({ where: { id: agentId, userId } });
		if (!agent) throw new Error("not_found");
		await agent.update({ isActive: false });
	}

	async listActiveAgents(userId: string): Promise<UserAgent[]> {
		return await UserAgent.findAll({
			where: { userId, isActive: true },
			order: [["createdAt", "ASC"]],
		});
	}
}

export const configAgentService = new ConfigAgentService();
