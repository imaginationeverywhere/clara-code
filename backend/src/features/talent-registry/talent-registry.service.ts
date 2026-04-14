import type { Pool } from "pg";

import type { PublicTalent, Talent, TalentStatus } from "./talent-registry.types";

type DbRow = Record<string, unknown>;

export class TalentRegistryService {
	constructor(private readonly db: Pool) {}

	async listApprovedTalents(category?: string): Promise<PublicTalent[]> {
		const query = category
			? `SELECT id, name, display_name, description, category, pricing_type, price_cents, voice_commands, install_count
         FROM talents WHERE status = 'approved' AND category = $1 ORDER BY install_count DESC`
			: `SELECT id, name, display_name, description, category, pricing_type, price_cents, voice_commands, install_count
         FROM talents WHERE status = 'approved' ORDER BY install_count DESC`;
		const result = await this.db.query(query, category ? [category] : []);
		return result.rows.map((row) => this.toPublicTalent(row));
	}

	async getTalentPublic(id: string): Promise<PublicTalent | null> {
		const result = await this.db.query(
			`SELECT id, name, display_name, description, category, pricing_type, price_cents, voice_commands, install_count
       FROM talents WHERE id = $1 AND status = 'approved'`,
			[id],
		);
		return result.rows[0] ? this.toPublicTalent(result.rows[0]) : null;
	}

	async installTalent(userId: string, talentId: string, stripeSubscriptionId?: string): Promise<void> {
		const insert = await this.db.query(
			`INSERT INTO talent_installs (user_id, talent_id, stripe_subscription_id)
       VALUES ($1, $2, $3) ON CONFLICT (user_id, talent_id) DO NOTHING RETURNING id`,
			[userId, talentId, stripeSubscriptionId ?? null],
		);
		if ((insert.rowCount ?? 0) === 0) {
			return;
		}
		await this.db.query(`UPDATE talents SET install_count = install_count + 1 WHERE id = $1`, [talentId]);
	}

	async uninstallTalent(userId: string, talentId: string): Promise<void> {
		const result = await this.db.query(`DELETE FROM talent_installs WHERE user_id = $1 AND talent_id = $2`, [
			userId,
			talentId,
		]);
		if ((result.rowCount ?? 0) > 0) {
			await this.db.query(`UPDATE talents SET install_count = GREATEST(install_count - 1, 0) WHERE id = $1`, [
				talentId,
			]);
		}
	}

	async getUserInstalls(userId: string): Promise<PublicTalent[]> {
		const result = await this.db.query(
			`SELECT t.id, t.name, t.display_name, t.description, t.category, t.pricing_type, t.price_cents, t.voice_commands, t.install_count
       FROM talents t
       JOIN talent_installs ti ON ti.talent_id = t.id
       WHERE ti.user_id = $1 AND t.status = 'approved'
       ORDER BY ti.installed_at DESC`,
			[userId],
		);
		return result.rows.map((row) => this.toPublicTalent(row));
	}

	async hasDeveloperProgram(userId: string): Promise<boolean> {
		const result = await this.db.query(
			`SELECT 1 FROM developer_programs WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()`,
			[userId],
		);
		return (result.rowCount ?? 0) > 0;
	}

	async getDeveloperProgramStatus(userId: string): Promise<{
		enrolled: boolean;
		status: string | null;
		expiresAt: Date | null;
	}> {
		const result = await this.db.query(`SELECT status, expires_at FROM developer_programs WHERE user_id = $1`, [
			userId,
		]);
		const row = result.rows[0] as { status?: string; expires_at?: Date | string } | undefined;
		if (!row) {
			return { enrolled: false, status: null, expiresAt: null };
		}
		const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(String(row.expires_at));
		const active = row.status === "active" && expiresAt > new Date();
		return { enrolled: active, status: row.status ?? null, expiresAt };
	}

	async activateDeveloperProgram(userId: string, stripeSubscriptionId: string): Promise<void> {
		const expiresAt = new Date();
		expiresAt.setFullYear(expiresAt.getFullYear() + 1);

		await this.db.query(
			`INSERT INTO developer_programs (user_id, stripe_subscription_id, status, expires_at)
     VALUES ($1, $2, 'active', $3)
     ON CONFLICT (user_id) DO UPDATE
     SET stripe_subscription_id = EXCLUDED.stripe_subscription_id,
         status = 'active',
         expires_at = EXCLUDED.expires_at`,
			[userId, stripeSubscriptionId, expiresAt],
		);
	}

	async cancelDeveloperProgram(stripeSubscriptionId: string): Promise<void> {
		await this.db.query(`UPDATE developer_programs SET status = 'canceled' WHERE stripe_subscription_id = $1`, [
			stripeSubscriptionId,
		]);
	}

	async submitTalent(
		developerUserId: string,
		data: {
			name: string;
			displayName: string;
			description?: string;
			category?: string;
			pricingType: "free" | "paid";
			priceCents?: number;
			subgraphUrl: string;
			voiceCommands?: unknown[];
		},
	): Promise<Talent> {
		const result = await this.db.query(
			`INSERT INTO talents (developer_user_id, name, display_name, description, category, pricing_type, price_cents, subgraph_url, voice_commands)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
       RETURNING *`,
			[
				developerUserId,
				data.name,
				data.displayName,
				data.description ?? null,
				data.category ?? null,
				data.pricingType,
				data.priceCents ?? null,
				data.subgraphUrl,
				JSON.stringify(data.voiceCommands ?? []),
			],
		);
		return this.toTalent(result.rows[0] as DbRow);
	}

	async updateTalent(
		talentId: string,
		developerUserId: string,
		updates: Partial<{
			displayName: string;
			description: string;
			category: string;
			voiceCommands: unknown[];
		}>,
	): Promise<Talent | null> {
		const fields: string[] = [];
		const values: unknown[] = [];
		let i = 1;
		if (updates.displayName !== undefined) {
			fields.push(`display_name = $${i}`);
			values.push(updates.displayName);
			i++;
		}
		if (updates.description !== undefined) {
			fields.push(`description = $${i}`);
			values.push(updates.description);
			i++;
		}
		if (updates.category !== undefined) {
			fields.push(`category = $${i}`);
			values.push(updates.category);
			i++;
		}
		if (updates.voiceCommands !== undefined) {
			fields.push(`voice_commands = $${i}::jsonb`);
			values.push(JSON.stringify(updates.voiceCommands));
			i++;
		}

		if (fields.length === 0) return null;

		values.push(talentId, developerUserId);
		const idxTalent = values.length - 1;
		const idxDev = values.length;
		const result = await this.db.query(
			`UPDATE talents SET ${fields.join(", ")} WHERE id = $${idxTalent} AND developer_user_id = $${idxDev} RETURNING *`,
			values,
		);
		return result.rows[0] ? this.toTalent(result.rows[0] as DbRow) : null;
	}

	async getDeveloperTalents(developerUserId: string): Promise<Talent[]> {
		const result = await this.db.query(
			`SELECT * FROM talents WHERE developer_user_id = $1 ORDER BY created_at DESC`,
			[developerUserId],
		);
		return result.rows.map((row) => this.toTalent(row as DbRow));
	}

	async getTalentAnalytics(talentId: string, developerUserId: string): Promise<Record<string, unknown> | null> {
		const result = await this.db.query(
			`SELECT id, name, display_name, install_count, status FROM talents WHERE id = $1 AND developer_user_id = $2`,
			[talentId, developerUserId],
		);
		const row = result.rows[0] as DbRow | undefined;
		if (!row) return null;
		return {
			id: row.id,
			name: row.name,
			displayName: row.display_name,
			installCount: row.install_count,
			status: row.status,
		};
	}

	async setTalentStatus(talentId: string, status: TalentStatus): Promise<void> {
		await this.db.query(`UPDATE talents SET status = $1, reviewed_at = NOW() WHERE id = $2`, [status, talentId]);
	}

	async getApprovedSubgraphUrls(): Promise<{ name: string; subgraphUrl: string }[]> {
		const result = await this.db.query(
			`SELECT name, subgraph_url FROM talents WHERE status = 'approved' AND subgraph_url IS NOT NULL`,
		);
		return result.rows.map((r: DbRow) => ({
			name: String(r.name),
			subgraphUrl: String(r.subgraph_url),
		}));
	}

	private toPublicTalent(row: DbRow): PublicTalent {
		return {
			id: String(row.id),
			name: String(row.name),
			displayName: String(row.display_name),
			description: row.description === null || row.description === undefined ? null : String(row.description),
			category:
				row.category === null || row.category === undefined
					? null
					: (String(row.category) as PublicTalent["category"]),
			pricingType: row.pricing_type === "paid" ? "paid" : "free",
			priceMonthly: row.price_cents !== null && row.price_cents !== undefined ? Number(row.price_cents) / 100 : null,
			voiceCommands: this.parseVoiceCommands(row.voice_commands),
			installCount: Number(row.install_count ?? 0),
		};
	}

	private parseVoiceCommands(raw: unknown): PublicTalent["voiceCommands"] {
		if (raw === null || raw === undefined) return null;
		if (Array.isArray(raw)) return raw as PublicTalent["voiceCommands"];
		if (typeof raw === "string") {
			try {
				const parsed: unknown = JSON.parse(raw);
				return Array.isArray(parsed) ? (parsed as PublicTalent["voiceCommands"]) : null;
			} catch {
				return null;
			}
		}
		return null;
	}

	private toTalent(row: DbRow): Talent {
		return {
			id: String(row.id),
			developerUserId: String(row.developer_user_id),
			name: String(row.name),
			displayName: String(row.display_name),
			description: row.description === null || row.description === undefined ? null : String(row.description),
			category:
				row.category === null || row.category === undefined ? null : (String(row.category) as Talent["category"]),
			pricingType: row.pricing_type === "paid" ? "paid" : "free",
			priceCents: row.price_cents === null || row.price_cents === undefined ? null : Number(row.price_cents),
			voiceCommands: this.parseVoiceCommands(row.voice_commands),
			status: String(row.status) as Talent["status"],
			installCount: Number(row.install_count ?? 0),
			createdAt: row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at)),
			reviewedAt:
				row.reviewed_at === null || row.reviewed_at === undefined
					? null
					: row.reviewed_at instanceof Date
						? row.reviewed_at
						: new Date(String(row.reviewed_at)),
		};
	}
}
