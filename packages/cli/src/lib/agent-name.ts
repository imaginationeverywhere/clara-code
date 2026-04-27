const RESERVED = new Set(["clara", "api", "test", "node", "git", "admin", "www", "null", "undefined", "new", "con"]);

const NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export type AgentNameResult = { ok: true } | { ok: false; message: string };

/** Validates kebab-case agent name for `clara init` (align with backend). */
export function validateAgentName(name: string): AgentNameResult {
	const t = name.trim();
	if (t.length === 0) {
		return { ok: false, message: "Agent name is required." };
	}
	if (t.length > 32) {
		return { ok: false, message: "Agent name must be 32 characters or fewer." };
	}
	if (!NAME_RE.test(t)) {
		return { ok: false, message: "Use kebab-case: lowercase letters, numbers, and single hyphens only." };
	}
	if (RESERVED.has(t)) {
		return { ok: false, message: "That name is reserved. Pick a different one." };
	}
	return { ok: true };
}
