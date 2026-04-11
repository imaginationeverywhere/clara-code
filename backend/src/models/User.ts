import {
	BeforeCreate,
	BeforeUpdate,
	Column,
	CreatedAt,
	DataType,
	Default,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";

/**
 * Enhanced User Role System for E-commerce Platform
 *
 * Role Hierarchy (highest to lowest permission):
 * - SITE_OWNER: Full system access, financial management, can assign all roles
 * - SITE_ADMIN: Full admin access except financial/owner functions, can assign ADMIN/STAFF/USER
 * - ADMIN: Product, order, customer management, can assign STAFF/USER roles
 * - STAFF: Limited admin access, customer service, order processing
 * - USER: Customer account access only
 */
export enum UserRole {
	SITE_OWNER = "SITE_OWNER",
	SITE_ADMIN = "SITE_ADMIN",
	ADMIN = "ADMIN",
	STAFF = "STAFF",
	USER = "USER",
}

export enum UserStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	SUSPENDED = "SUSPENDED",
}

interface UserPreferences {
	emailNotifications: boolean;
	smsNotifications: boolean;
	marketingEmails: boolean;
	adminAlerts?: boolean;
	orderNotifications?: boolean;
}

interface UserStats {
	totalOrders: number;
	totalSpent: number;
	averageOrderValue: number;
	lastOrderDate?: Date;
	accountCreated: Date;
	lastLoginAt?: Date;
}

interface Address {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

@Table({
	tableName: "users",
	timestamps: true,
	indexes: [
		{ fields: ["clerk_id"], unique: true },
		{ fields: ["email"], unique: true },
		{ fields: ["role"] },
		{ fields: ["status"] },
		{ fields: ["created_at"] },
		{ fields: ["is_guest"] },
	],
})
export class User extends Model {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
		unique: true,
	})
	declare clerkId: string | null;

	@Column({
		type: DataType.STRING,
		allowNull: true,
		unique: true,
		validate: {
			isEmail: true,
		},
	})
	declare email: string | null;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	declare firstName: string | null;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	declare lastName: string | null;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	declare phone: string | null;

	@Column({
		type: DataType.ENUM(...Object.values(UserRole)),
		allowNull: false,
		defaultValue: UserRole.USER,
	})
	declare role: UserRole;

	@Column({
		type: DataType.ENUM(...Object.values(UserStatus)),
		allowNull: false,
		defaultValue: UserStatus.ACTIVE,
	})
	declare status: UserStatus;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	declare imageUrl: string | null;

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	declare dateOfBirth: Date | null;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	declare address: Address | null;

	@Column({
		type: DataType.JSONB,
		allowNull: false,
		defaultValue: {
			emailNotifications: true,
			smsNotifications: false,
			marketingEmails: true,
			adminAlerts: false,
			orderNotifications: true,
		},
	})
	declare preferences: UserPreferences;

	@Column({
		type: DataType.TEXT,
		allowNull: true,
	})
	declare notes: string | null;

	@Column({
		type: DataType.ARRAY(DataType.STRING),
		allowNull: false,
		defaultValue: [],
	})
	declare tags: string[];

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	declare lastLoginAt: Date | null;

	// Guest user support for checkout
	@Column({
		type: DataType.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	})
	declare isGuest: boolean;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	declare guestSessionId: string | null;

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	declare convertedToRegisteredAt: Date | null;

	@CreatedAt
	declare createdAt: Date;

	@UpdatedAt
	declare updatedAt: Date;

	// Virtual fields
	get fullName(): string {
		return [this.firstName, this.lastName].filter(Boolean).join(" ") || this.email || "User";
	}

	get displayName(): string {
		if (this.isGuest) {
			return `Guest ${this.email ? `(${this.email})` : ""}`.trim();
		}
		return this.fullName;
	}

	get stats(): UserStats {
		// This would be calculated from related orders
		// For now, return default values
		return {
			totalOrders: 0,
			totalSpent: 0,
			averageOrderValue: 0,
			accountCreated: this.createdAt,
			...(this.lastLoginAt != null ? { lastLoginAt: this.lastLoginAt } : {}),
		};
	}

	get isAdmin(): boolean {
		return [UserRole.SITE_OWNER, UserRole.SITE_ADMIN, UserRole.ADMIN, UserRole.STAFF].includes(this.role);
	}

	get hasFinancialAccess(): boolean {
		return [UserRole.SITE_OWNER, UserRole.SITE_ADMIN].includes(this.role);
	}

	get canManageUsers(): boolean {
		return [UserRole.SITE_OWNER, UserRole.SITE_ADMIN, UserRole.ADMIN].includes(this.role);
	}

	get canManageOrders(): boolean {
		return [UserRole.SITE_OWNER, UserRole.SITE_ADMIN, UserRole.ADMIN, UserRole.STAFF].includes(this.role);
	}

	get canManageProducts(): boolean {
		return [UserRole.SITE_OWNER, UserRole.SITE_ADMIN, UserRole.ADMIN].includes(this.role);
	}

	// Role hierarchy methods
	hasRole(role: UserRole): boolean {
		return this.role === role;
	}

	hasMinimumRole(minimumRole: UserRole): boolean {
		const hierarchy = {
			[UserRole.SITE_OWNER]: 5,
			[UserRole.SITE_ADMIN]: 4,
			[UserRole.ADMIN]: 3,
			[UserRole.STAFF]: 2,
			[UserRole.USER]: 1,
		};

		return hierarchy[this.role] >= hierarchy[minimumRole];
	}

	canAssignRole(roleToAssign: UserRole): boolean {
		const permissions: Record<UserRole, UserRole[]> = {
			[UserRole.SITE_OWNER]: [UserRole.SITE_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.USER],
			[UserRole.SITE_ADMIN]: [UserRole.ADMIN, UserRole.STAFF, UserRole.USER],
			[UserRole.ADMIN]: [UserRole.STAFF, UserRole.USER],
			[UserRole.STAFF]: [UserRole.USER],
			[UserRole.USER]: [],
		};

		return permissions[this.role]?.includes(roleToAssign) ?? false;
	}

	// Class methods
	static async findByEmail(email: string): Promise<User | null> {
		if (!email) return null;
		return User.findOne({ where: { email: email.toLowerCase() } });
	}

	static async findByClerkId(clerkId: string): Promise<User | null> {
		return User.findOne({ where: { clerkId } });
	}

	static async findByGuestSessionId(sessionId: string): Promise<User | null> {
		return User.findOne({ where: { guestSessionId: sessionId, isGuest: true } });
	}

	static async createFromClerk(clerkData: {
		id: string;
		emailAddresses: Array<{ emailAddress: string }>;
		firstName?: string;
		lastName?: string;
		imageUrl?: string;
	}): Promise<User> {
		const email = clerkData.emailAddresses?.[0]?.emailAddress.toLowerCase();

		return User.create({
			clerkId: clerkData.id,
			email,
			firstName: clerkData.firstName,
			lastName: clerkData.lastName,
			imageUrl: clerkData.imageUrl,
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			preferences: {
				emailNotifications: true,
				smsNotifications: false,
				marketingEmails: true,
				adminAlerts: false,
				orderNotifications: true,
			},
		});
	}

	static async createGuestUser(email?: string, sessionId?: string): Promise<User> {
		return User.create({
			clerkId: null,
			email: email?.toLowerCase(),
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			isGuest: true,
			guestSessionId: sessionId || require("crypto").randomUUID(),
			preferences: {
				emailNotifications: false,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: true,
			},
		});
	}

	// Convert guest user to registered user
	async convertToRegistered(clerkData: {
		id: string;
		emailAddresses: Array<{ emailAddress: string }>;
		firstName?: string;
		lastName?: string;
		imageUrl?: string;
	}): Promise<void> {
		const email = clerkData.emailAddresses?.[0]?.emailAddress.toLowerCase();

		await this.update({
			clerkId: clerkData.id,
			email: email || this.email,
			firstName: clerkData.firstName,
			lastName: clerkData.lastName,
			imageUrl: clerkData.imageUrl,
			isGuest: false,
			convertedToRegisteredAt: new Date(),
			preferences: {
				...this.preferences,
				emailNotifications: true,
				marketingEmails: true,
			},
		});
	}

	// Update last login timestamp
	async updateLastLogin(): Promise<void> {
		await this.update({ lastLoginAt: new Date() });
	}

	// Hooks for automatic email normalization
	@BeforeCreate
	@BeforeUpdate
	static normalizeEmail(instance: User) {
		if (instance.email) {
			instance.email = instance.email.toLowerCase();
		}
	}
}
