/**
 * Vault tools - read/write/append operations on ~/auset-brain/
 *
 * The Auset Brain vault is the shared cross-project, cross-machine memory for
 * Amen Ra and Quik. All paths are resolved relative to ~/auset-brain/ and
 * validated to stay within the vault.
 */

import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Text } from "@mariozechner/pi-tui";
import { type Static, Type } from "@sinclair/typebox";
import {
	appendFile as fsAppendFile,
	mkdir as fsMkdir,
	readFile as fsReadFile,
	writeFile as fsWriteFile,
} from "fs/promises";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
import type { ToolDefinition } from "../extensions/types.js";
import { shortenPath, str } from "./render-utils.js";
import { wrapToolDefinition } from "./tool-definition-wrapper.js";

// ---------------------------------------------------------------------------
// Vault root
// ---------------------------------------------------------------------------

function getVaultRoot(): string {
	return join(homedir(), "auset-brain");
}

/**
 * Resolve a vault-relative path and validate it stays within the vault.
 * Throws if the resolved path escapes ~/auset-brain/.
 */
function resolveVaultPath(relativePath: string): string {
	const vaultRoot = getVaultRoot();
	const candidate = relativePath.startsWith("/") ? relativePath : join(vaultRoot, relativePath);
	const resolved = resolve(candidate);
	if (!resolved.startsWith(vaultRoot + "/") && resolved !== vaultRoot) {
		throw new Error(`Path "${relativePath}" is outside the vault (~/auset-brain/).`);
	}
	return resolved;
}

// ---------------------------------------------------------------------------
// vault_read
// ---------------------------------------------------------------------------

const vaultReadSchema = Type.Object({
	path: Type.String({
		description: "Path relative to ~/auset-brain/ (e.g. 'Daily/2026-04-10.md' or 'Swarms/live-feed.md')",
	}),
	offset: Type.Optional(Type.Number({ description: "Line number to start reading from (1-indexed)" })),
	limit: Type.Optional(Type.Number({ description: "Maximum number of lines to read" })),
});

export type VaultReadToolInput = Static<typeof vaultReadSchema>;

function formatVaultReadCall(
	args: { path?: string; offset?: number; limit?: number } | undefined,
	theme: typeof import("../../modes/interactive/theme/theme.js").theme,
): string {
	const pathStr = str(args?.path);
	const displayPath = pathStr ? `~/auset-brain/${shortenPath(pathStr)}` : "...";
	return `${theme.fg("toolTitle", theme.bold("vault_read"))} ${theme.fg("accent", displayPath)}`;
}

export function createVaultReadToolDefinition(): ToolDefinition<typeof vaultReadSchema, undefined> {
	return {
		name: "vault_read",
		label: "vault_read",
		description:
			"Read a file from the Auset Brain vault (~/auset-brain/). Use for cross-project memory: session tracker, daily notes, swarm live-feed, team registry.",
		parameters: vaultReadSchema,
		async execute(_toolCallId, { path, offset, limit }) {
			const absolutePath = resolveVaultPath(str(path) ?? "");
			const raw = await fsReadFile(absolutePath, "utf-8");
			const lines = raw.split("\n");
			const startIndex = Math.max(0, (offset ?? 1) - 1);
			const sliced = limit !== undefined ? lines.slice(startIndex, startIndex + limit) : lines.slice(startIndex);
			return { content: [{ type: "text", text: sliced.join("\n") }], details: undefined };
		},
		renderCall(args, theme, context) {
			const text = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
			text.setText(formatVaultReadCall(args, theme));
			return text;
		},
		renderResult(result, _options, theme, context) {
			const text = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
			const output = (result.content ?? [])
				.filter((c: any) => c.type === "text")
				.map((c: any) => c.text ?? "")
				.join("\n");
			text.setText(output ? `\n${theme.fg("toolOutput", output)}` : "");
			return text;
		},
	};
}

export function createVaultReadTool(): AgentTool<typeof vaultReadSchema> {
	return wrapToolDefinition(createVaultReadToolDefinition());
}

export const vaultReadToolDefinition = createVaultReadToolDefinition();
export const vaultReadTool = createVaultReadTool();

// ---------------------------------------------------------------------------
// vault_write
// ---------------------------------------------------------------------------

const vaultWriteSchema = Type.Object({
	path: Type.String({
		description: "Path relative to ~/auset-brain/ (e.g. 'Daily/2026-04-10.md')",
	}),
	content: Type.String({ description: "Content to write to the file (overwrites existing content)" }),
});

export type VaultWriteToolInput = Static<typeof vaultWriteSchema>;

export function createVaultWriteToolDefinition(): ToolDefinition<typeof vaultWriteSchema, undefined> {
	return {
		name: "vault_write",
		label: "vault_write",
		description:
			"Write a file to the Auset Brain vault (~/auset-brain/). Creates parent directories as needed. Overwrites existing content. Use vault_append to add to an existing file.",
		parameters: vaultWriteSchema,
		async execute(_toolCallId, { path, content }) {
			const absolutePath = resolveVaultPath(str(path) ?? "");
			await fsMkdir(dirname(absolutePath), { recursive: true });
			await fsWriteFile(absolutePath, content ?? "", "utf-8");
			return { content: [{ type: "text", text: `Written: ${absolutePath}` }], details: undefined };
		},
		renderCall(args, theme, context) {
			const text = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
			const pathStr = str(args?.path);
			const displayPath = pathStr ? `~/auset-brain/${shortenPath(pathStr)}` : "...";
			text.setText(`${theme.fg("toolTitle", theme.bold("vault_write"))} ${theme.fg("accent", displayPath)}`);
			return text;
		},
		renderResult(result, _options, theme, context) {
			const text = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
			const output = (result.content ?? [])
				.filter((c: any) => c.type === "text")
				.map((c: any) => c.text ?? "")
				.join("\n");
			text.setText(output ? `\n${theme.fg("toolOutput", output)}` : "");
			return text;
		},
	};
}

export function createVaultWriteTool(): AgentTool<typeof vaultWriteSchema> {
	return wrapToolDefinition(createVaultWriteToolDefinition());
}

export const vaultWriteToolDefinition = createVaultWriteToolDefinition();
export const vaultWriteTool = createVaultWriteTool();

// ---------------------------------------------------------------------------
// vault_append
// ---------------------------------------------------------------------------

const vaultAppendSchema = Type.Object({
	path: Type.String({
		description: "Path relative to ~/auset-brain/ (e.g. 'Swarms/live-feed.md')",
	}),
	content: Type.String({ description: "Content to append. A newline is added automatically if not present." }),
});

export type VaultAppendToolInput = Static<typeof vaultAppendSchema>;

export function createVaultAppendToolDefinition(): ToolDefinition<typeof vaultAppendSchema, undefined> {
	return {
		name: "vault_append",
		label: "vault_append",
		description:
			"Append a line to a file in the Auset Brain vault (~/auset-brain/). Use for swarm live-feed, session tracker, and other append-only logs. Creates the file if it does not exist.",
		parameters: vaultAppendSchema,
		async execute(_toolCallId, { path, content }) {
			const absolutePath = resolveVaultPath(str(path) ?? "");
			await fsMkdir(dirname(absolutePath), { recursive: true });
			const line = (content ?? "").endsWith("\n") ? content : `${content}\n`;
			await fsAppendFile(absolutePath, line ?? "", "utf-8");
			return { content: [{ type: "text", text: `Appended to: ${absolutePath}` }], details: undefined };
		},
		renderCall(args, theme, context) {
			const text = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
			const pathStr = str(args?.path);
			const displayPath = pathStr ? `~/auset-brain/${shortenPath(pathStr)}` : "...";
			text.setText(`${theme.fg("toolTitle", theme.bold("vault_append"))} ${theme.fg("accent", displayPath)}`);
			return text;
		},
		renderResult(result, _options, theme, context) {
			const text = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
			const output = (result.content ?? [])
				.filter((c: any) => c.type === "text")
				.map((c: any) => c.text ?? "")
				.join("\n");
			text.setText(output ? `\n${theme.fg("toolOutput", output)}` : "");
			return text;
		},
	};
}

export function createVaultAppendTool(): AgentTool<typeof vaultAppendSchema> {
	return wrapToolDefinition(createVaultAppendToolDefinition());
}

export const vaultAppendToolDefinition = createVaultAppendToolDefinition();
export const vaultAppendTool = createVaultAppendTool();
