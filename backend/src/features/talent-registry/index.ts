export { createDeveloperProgramRouter } from "./developer-program.routes";
export { createTalentAdminRouter, createTalentRegistryRouter } from "./talent-registry.routes";
export { TalentRegistryService } from "./talent-registry.service";
export type {
	DeveloperProgram,
	PublicTalent,
	Talent,
	TalentCategory,
	TalentStatus,
	VoiceCommandPattern,
} from "./talent-registry.types";
export { getTalentRegistryService } from "./talent-registry-instance";
