import { Pool } from "pg";

import { TalentRegistryService } from "./talent-registry.service";

let cached: TalentRegistryService | null = null;

export function getTalentRegistryService(): TalentRegistryService {
	if (!cached) {
		cached = new TalentRegistryService(new Pool({ connectionString: process.env.DATABASE_URL }));
	}
	return cached;
}
