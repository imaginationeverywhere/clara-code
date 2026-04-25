import { resolveBackendUrl } from "./backend.js";
import { readClaraCredentials } from "./credentials-store.js";

export type TemplateDto = {
	id: string;
	displayName: string;
	shortDescription: string;
	category: string;
	industryVertical: string | null;
	soulMdTemplate: string;
	suggestedSkills: Array<{ id: string; name: string }>;
	defaultVoiceId: string;
	isPublic: boolean;
	sortOrder: number;
};

export type UserAgentDto = {
	id: string;
	userId: string;
	templateId: string;
	name: string;
	voiceId: string;
	attachedSkills: unknown;
	personalityTweaks: Record<string, string>;
	soulMd: string;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
};

function authHeader(): string {
	const c = readClaraCredentials();
	if (!c?.token) {
		throw new Error("Not authenticated. Run: clara auth login");
	}
	return `Bearer ${c.token}`;
}

function apiBase(): string {
	return `${resolveBackendUrl().url}/api`;
}

export async function fetchTemplates(): Promise<TemplateDto[]> {
	const r = await fetch(`${apiBase()}/agents/templates`, {
		headers: { Authorization: authHeader() },
	});
	if (!r.ok) {
		throw new Error(`templates: ${r.status} ${await r.text()}`);
	}
	const j = (await r.json()) as { templates: TemplateDto[] };
	return j.templates;
}

export async function configureAgent(input: {
	templateId: string;
	name: string;
	voice: { source: "library"; voiceId: string } | { source: "clone"; audioBase64: string };
	skillIds: string[];
}): Promise<UserAgentDto> {
	const r = await fetch(`${apiBase()}/agents/configure`, {
		method: "POST",
		headers: {
			Authorization: authHeader(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			template_id: input.templateId,
			name: input.name,
			voice: input.voice,
			skill_ids: input.skillIds,
		}),
	});
	if (!r.ok) {
		throw new Error(`configure: ${r.status} ${await r.text()}`);
	}
	const j = (await r.json()) as { agent: UserAgentDto };
	return j.agent;
}
