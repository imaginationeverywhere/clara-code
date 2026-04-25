import { describe, expect, it } from "@jest/globals";
import { agentPhaseService, isSkillCompatible } from "@/services/agent-phase.service";

describe("AgentPhaseService", () => {
	it("getDefaultSkills(builder) returns technical skills", () => {
		const s = agentPhaseService.getDefaultSkills("builder");
		expect(s).toContain("react");
		expect(s).toContain("typescript");
	});

	it("getDefaultSkills(runtime) returns conversational skills", () => {
		const s = agentPhaseService.getDefaultSkills("runtime");
		expect(s).toContain("voice-persona-design");
	});

	it("isSkillCompatible: builder cannot use runtime-only skills", () => {
		expect(isSkillCompatible("voice-persona-design", "builder")).toBe(false);
	});

	it("isSkillCompatible: runtime cannot use builder-only skills", () => {
		expect(isSkillCompatible("docker", "runtime")).toBe(false);
	});

	it("isSkillCompatible: rental works for both", () => {
		expect(isSkillCompatible("rental", "builder")).toBe(true);
		expect(isSkillCompatible("rental", "runtime")).toBe(true);
	});

	it("buildPhaseContext includes vertical for builder", () => {
		const t = agentPhaseService.buildPhaseContext("builder", "rental");
		expect(t).toContain("BUILDER");
		expect(t).toContain("rental");
	});
});
