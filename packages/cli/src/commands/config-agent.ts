import type { Command } from "commander";
import prompts from "prompts";
import { configureAgent, fetchTemplates } from "../lib/agents-api.js";
import { captureVoiceSample } from "../lib/audio-capture.js";

export function registerConfigAgentCommand(program: Command): void {
	program
		.command("config-agent")
		.alias("configure-agent")
		.description("Configure a new harness agent for your team (from Clara templates)")
		.action(async () => {
			const templates = await fetchTemplates();
			if (templates.length === 0) {
				console.error("No agent templates available from the API.");
				process.exitCode = 1;
				return;
			}

			const cats = Array.from(new Set(templates.map((t) => t.category)));
			const { category } = await prompts({
				type: "select",
				name: "category",
				message: "What kind of agent?",
				choices: cats.map((c) => ({ title: c, value: c })),
			});
			if (category == null) {
				process.exitCode = 1;
				return;
			}
			const inCat = templates.filter((t) => t.category === category);
			const { templateId } = await prompts({
				type: "select",
				name: "templateId",
				message: "Which template?",
				choices: inCat.map((t) => ({
					title: `${t.displayName} — ${t.shortDescription}`,
					value: t.id,
				})),
			});
			if (templateId == null) {
				process.exitCode = 1;
				return;
			}

			const { name } = await prompts({
				type: "text",
				name: "name",
				message: "Name them",
				validate: (s: string) => (s.trim().length > 0 ? true : "Name is required"),
			});
			if (name == null || String(name).trim().length === 0) {
				process.exitCode = 1;
				return;
			}

			const { voiceChoice } = await prompts({
				type: "select",
				name: "voiceChoice",
				message: "Voice",
				choices: [
					{ title: "Clone my voice (5-sec sample)", value: "clone" },
					{ title: "Pick from Clara's library", value: "library" },
				],
			});
			if (voiceChoice == null) {
				process.exitCode = 1;
				return;
			}

			let voice: { source: "library"; voiceId: string } | { source: "clone"; audioBase64: string };
			if (voiceChoice === "clone") {
				console.log("Recording 5 seconds... (install sox/rec for real capture; otherwise empty sample.)");
				const audioBase64 = await captureVoiceSample({ durationSeconds: 5 });
				voice = { source: "clone", audioBase64 };
			} else {
				const { voiceId } = await prompts({
					type: "select",
					name: "voiceId",
					message: "Library voice",
					choices: [
						{ title: "Clara (default)", value: "clara-default" },
						{ title: "Marcus (deep)", value: "marcus-deep" },
					],
				});
				if (voiceId == null) {
					process.exitCode = 1;
					return;
				}
				voice = { source: "library", voiceId };
			}

			const tpl = inCat.find((t) => t.id === templateId);
			const available = tpl?.suggestedSkills ?? [];
			const { skillIds } = await prompts({
				type: "multiselect",
				name: "skillIds",
				message: "Attach skills",
				choices: available.map((s) => ({
					title: s.name,
					value: s.id,
					selected: true,
				})),
			});
			const skills = Array.isArray(skillIds) ? (skillIds as string[]) : [];

			const agent = await configureAgent({
				templateId,
				name: String(name).trim(),
				voice,
				skillIds: skills,
			});
			console.log(`OK ${agent.name} (${agent.templateId}) is ready.`);
		});
}
