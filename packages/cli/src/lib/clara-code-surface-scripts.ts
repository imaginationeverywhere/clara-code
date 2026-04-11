/**
 * Canonical Clara Code copy for CLI/TUI (Surface C) and shared references.
 * Mirrors VRD-001 + CLARA-CODE-VOICE-PLAYBOOK — do not paraphrase for user-facing terminal output.
 */

export const CLARA_CODE_VERSION_LABEL = "Clara Code";

/** VRD-001 §C1 — first launch (terminal text) */
export const SURFACE_C1_LINES = [
	"I've never written a line of code.",
	"Whether you've done it before or not.",
	"We speak things into existence around here.",
] as const;

export const SURFACE_C1_PROMPT = "What are we building?";

/** VRD-001 Surface E — once per relationship after first win */
export const SIX_SIDE_PROJECTS_QUESTION = "What's the thing you've been wanting to build for the longest time?";

/** Playbook §7 — fixed phrases */
export const FIXED_ERROR_FIX = "That's wrong. Here's the correct version.";
