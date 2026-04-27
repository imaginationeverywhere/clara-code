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

export type AgentInitResult = {
	cloneUrl: string;
	repoUrl: string;
	repository?: string;
};

export async function postAgentInit(
	name: string,
	backendFlag?: string,
	overrides?: { token?: string; fetch?: typeof fetch },
): Promise<AgentInitResult> {
	const { url: base } = resolveBackendUrl(backendFlag);
	const token = overrides?.token ?? readClaraCredentials()?.token;
	if (!token) {
		throw new Error("not_authenticated");
	}
	const fetchFn = overrides?.fetch ?? globalThis.fetch;
	const r = await fetchFn(`${base}/api/agents/init`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name }),
	});
	const text = await r.text();
	let body: {
		cloneUrl?: string;
		repoUrl?: string;
		repository?: string;
		reason?: string;
		message?: string;
		upgrade_url?: string;
		error?: string;
	} = {};
	try {
		body = JSON.parse(text) as typeof body;
	} catch {
		// not json
	}
	if (r.status === 401) {
		throw new Error("unauthorized");
	}
	if (r.status === 403 && body.reason === "tier_lock") {
		const err = new Error("tier_lock") as Error & { upgradeUrl?: string };
		err.upgradeUrl = typeof body.upgrade_url === "string" ? body.upgrade_url : undefined;
		throw err;
	}
	if (!r.ok) {
		const msg = body.message ?? body.error ?? text;
		throw new Error(`init_failed: ${r.status} ${msg}`);
	}
	if (typeof body.cloneUrl !== "string" || typeof body.repoUrl !== "string") {
		throw new Error("init_failed: bad response from server");
	}
	return { cloneUrl: body.cloneUrl, repoUrl: body.repoUrl, repository: body.repository };
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
