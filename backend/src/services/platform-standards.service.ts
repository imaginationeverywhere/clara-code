import { sanitize } from "@/lib/ip-firewall";

export interface ValidationResult {
	approved: boolean;
	rejectionReason?: string;
	sanitizedInstruction?: string;
}

const FORBIDDEN_INSTRUCTION_PATTERNS: RegExp[] = [
	/disable.{0,20}(safety|firewall|standards)/i,
	/ignore.{0,20}(consent|compliance|terms)/i,
	/lie.{0,20}(about|to)/i,
	/access.{0,20}(other.{0,20}(site|tenant))/i,
	/remove.{0,20}clara.{0,20}branding/i,
	/bypass.{0,20}(payment|checkout|stripe)/i,
];

const RESTRICTED_CATEGORIES = new Set(["payment", "compliance", "multi_tenant", "branding"]);

export class PlatformStandardsService {
	async validate(instruction: string, category: string): Promise<ValidationResult> {
		for (const pattern of FORBIDDEN_INSTRUCTION_PATTERNS) {
			if (pattern.test(instruction)) {
				return {
					approved: false,
					rejectionReason: "Instruction violates platform standards (restricted action).",
				};
			}
		}
		if (RESTRICTED_CATEGORIES.has(category)) {
			return {
				approved: false,
				rejectionReason: `Category "${category}" requires platform approval. Contact support.`,
			};
		}
		return { approved: true, sanitizedInstruction: sanitize(instruction) };
	}
}

export const platformStandards = new PlatformStandardsService();
