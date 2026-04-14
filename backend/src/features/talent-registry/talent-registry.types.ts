export type TalentStatus = "pending" | "approved" | "rejected" | "suspended";
export type TalentCategory = "productivity" | "data" | "communication" | "developer-tools" | "other";

export interface Talent {
	id: string;
	developerUserId: string;
	name: string;
	displayName: string;
	description: string | null;
	category: TalentCategory | null;
	pricingType: "free" | "paid";
	priceCents: number | null;
	voiceCommands: VoiceCommandPattern[] | null;
	status: TalentStatus;
	installCount: number;
	createdAt: Date;
	reviewedAt: Date | null;
}

export interface VoiceCommandPattern {
	pattern: string;
	description: string;
	examples: string[];
}

export interface PublicTalent {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	category: TalentCategory | null;
	pricingType: "free" | "paid";
	priceMonthly: number | null;
	voiceCommands: VoiceCommandPattern[] | null;
	installCount: number;
}

export interface DeveloperProgram {
	id: string;
	userId: string;
	status: "active" | "canceled";
	expiresAt: Date;
}
