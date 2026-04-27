/**
 * Provision a per-user agent GitHub repo from a template (GitHub "generate from template" API).
 * Naming: `{org}/{vpHandle}-{agentName}` (see strategy briefing).
 */

import { User } from "@/models/User";
import { PLAN_LIMITS, type PlanTier } from "@/services/plan-limits";
import { logger } from "@/utils/logger";

const RESERVED = new Set(["clara", "api", "test", "node", "git", "admin", "www", "null", "undefined", "new", "con"]);

const NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export type AgentNameValidation = { valid: true } | { valid: false; message: string };

export function validateAgentNameForInit(name: string): AgentNameValidation {
	const t = name.trim();
	if (t.length === 0) {
		return { valid: false, message: "Agent name is required." };
	}
	if (t.length > 32) {
		return { valid: false, message: "Agent name must be 32 characters or fewer." };
	}
	if (!NAME_RE.test(t)) {
		return { valid: false, message: "Use kebab-case: lowercase letters, numbers, and single hyphens only." };
	}
	if (RESERVED.has(t)) {
		return { valid: false, message: "That name is reserved. Pick a different one." };
	}
	return { valid: true };
}

function slugifyEmailLocalPart(email: string): string {
	const local = email.split("@")[0] ?? "user";
	const slug = local
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	if (slug.length === 0) {
		return "user";
	}
	// GitHub repo names: start with letter is conventional
	const withLetter = /^[0-9]/.test(slug) ? `u-${slug}` : slug;
	return withLetter.slice(0, 20);
}

/** Short stable suffix so two accounts with the same email local do not collide. */
export function deriveVpHandle(user: User): string {
	const idPart = String(user.id).replace(/-/g, "").slice(0, 8);
	const fromEmail = user.email ? slugifyEmailLocalPart(user.email) : "user";
	return `${fromEmail}-${idPart}`
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export type AgentInitConfig = {
	token: string;
	org: string;
	templateOwner: string;
	templateRepo: string;
};

export function getAgentInitConfigFromEnv(): AgentInitConfig | null {
	const token = process.env.GITHUB_TOKEN?.trim();
	if (!token) {
		return null;
	}
	const org = (process.env.GITHUB_AGENT_INIT_ORG ?? "imaginationeverywhere").trim();
	const templateOwner = (process.env.GITHUB_AGENT_TEMPLATE_OWNER ?? "imaginationeverywhere").trim();
	const templateRepo = (process.env.GITHUB_AGENT_TEMPLATE_REPO ?? "agent-template").trim();
	if (!org || !templateOwner || !templateRepo) {
		return null;
	}
	return { token, org, templateOwner, templateRepo };
}

export function canTierInitAgentRepo(tier: PlanTier): boolean {
	return PLAN_LIMITS[tier].canBuildAgents === true;
}

/**
 * `POST /repos/{template_owner}/{template_repo}/generate` — see GitHub REST.
 */
export async function createRepositoryFromTemplate(params: {
	config: AgentInitConfig;
	repoName: string;
}): Promise<{ cloneUrl: string; repoUrl: string; fullName: string }> {
	const { config, repoName } = params;
	const url = `https://api.github.com/repos/${config.templateOwner}/${config.templateRepo}/generate`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${config.token}`,
			"X-GitHub-Api-Version": "2022-11-28",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: repoName,
			description: "Clara Code agent repository",
			private: false,
			owner: config.org,
		}),
	});

	const text = await res.text();
	let body: { html_url?: string; clone_url?: string; full_name?: string; message?: string } = {};
	try {
		body = JSON.parse(text) as typeof body;
	} catch {
		// not json
	}

	if (!res.ok) {
		logger.error("[agent-init] GitHub generate failed:", res.status, text);
		if (res.status === 422 || res.status === 409) {
			throw new Error("repo_name_unavailable");
		}
		throw new Error("github_error");
	}

	const html = body.html_url;
	const clone = body.clone_url;
	const full = body.full_name;
	if (typeof html !== "string" || typeof clone !== "string" || typeof full !== "string") {
		logger.error("[agent-init] unexpected GitHub response:", text);
		throw new Error("github_error");
	}

	return { cloneUrl: clone, repoUrl: html, fullName: full };
}

export async function resolveUserForAgentInit(claraUserId: string): Promise<User | null> {
	if (claraUserId.startsWith("user_")) {
		return User.findByClerkId(claraUserId);
	}
	return User.findByPk(claraUserId);
}
