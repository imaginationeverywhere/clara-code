import "@/config/database";
import { User, UserRole, UserStatus } from "@/models/User";

describe("User model", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("normalizeEmail lowercases email", () => {
		const instance = { email: "HELLO@EXAMPLE.COM" } as User;
		User.normalizeEmail(instance);
		expect(instance.email).toBe("hello@example.com");
	});

	it("normalizeEmail skips when email missing", () => {
		const instance = {} as User;
		User.normalizeEmail(instance);
		expect(instance.email).toBeUndefined();
	});

	it("fullName joins first and last", () => {
		const u = User.build({
			firstName: "Ada",
			lastName: "Lovelace",
			email: "a@b.com",
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			preferences: {
				emailNotifications: true,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
			isGuest: false,
		});
		expect(u.fullName).toBe("Ada Lovelace");
	});

	it("fullName falls back to email", () => {
		const u = User.build({
			email: "only@example.com",
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			preferences: {
				emailNotifications: true,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
			isGuest: false,
		});
		expect(u.fullName).toBe("only@example.com");
	});

	it("displayName for guest", () => {
		const u = User.build({
			email: "g@g.com",
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			isGuest: true,
			preferences: {
				emailNotifications: false,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
		});
		expect(u.displayName).toContain("Guest");
	});

	it("displayName for guest without email", () => {
		const u = User.build({
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			isGuest: true,
			preferences: {
				emailNotifications: false,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
		});
		expect(u.displayName.trim()).toBe("Guest");
	});

	it("stats includes lastLoginAt when set", () => {
		const last = new Date("2021-01-01T00:00:00.000Z");
		const u = User.build({
			email: "a@b.com",
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			preferences: {
				emailNotifications: true,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
			isGuest: false,
			lastLoginAt: last,
			createdAt: new Date(),
		});
		expect(u.stats.lastLoginAt).toEqual(last);
	});

	it("role getters", () => {
		const owner = User.build({
			email: "o@b.com",
			role: UserRole.SITE_OWNER,
			status: UserStatus.ACTIVE,
			preferences: {
				emailNotifications: true,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
			isGuest: false,
			createdAt: new Date(),
		});
		expect(owner.isAdmin).toBe(true);
		expect(owner.hasFinancialAccess).toBe(true);
		expect(owner.canManageUsers).toBe(true);
		expect(owner.canManageOrders).toBe(true);
		expect(owner.canManageProducts).toBe(true);
	});

	it("hasRole and hasMinimumRole", () => {
		const staff = User.build({
			email: "s@b.com",
			role: UserRole.STAFF,
			status: UserStatus.ACTIVE,
			preferences: {
				emailNotifications: true,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
			isGuest: false,
			createdAt: new Date(),
		});
		expect(staff.hasRole(UserRole.STAFF)).toBe(true);
		expect(staff.hasMinimumRole(UserRole.USER)).toBe(true);
		expect(staff.hasMinimumRole(UserRole.SITE_OWNER)).toBe(false);
	});

	it("canAssignRole", () => {
		const admin = User.build({
			email: "a@b.com",
			role: UserRole.ADMIN,
			status: UserStatus.ACTIVE,
			preferences: {
				emailNotifications: true,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
			isGuest: false,
			createdAt: new Date(),
		});
		expect(admin.canAssignRole(UserRole.STAFF)).toBe(true);
		expect(admin.canAssignRole(UserRole.SITE_OWNER)).toBe(false);
		const endUser = User.build({
			email: "u@b.com",
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			preferences: {
				emailNotifications: true,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
			isGuest: false,
			createdAt: new Date(),
		});
		expect(endUser.canAssignRole(UserRole.USER)).toBe(false);
	});

	it("findByEmail returns null for empty", async () => {
		await expect(User.findByEmail("")).resolves.toBeNull();
	});

	it("findByEmail delegates to findOne", async () => {
		jest.spyOn(User, "findOne").mockResolvedValueOnce(null);
		await User.findByEmail("Test@X.COM");
		expect(User.findOne).toHaveBeenCalledWith({ where: { email: "test@x.com" } });
	});

	it("findByClerkId and findByGuestSessionId", async () => {
		jest.spyOn(User, "findOne").mockResolvedValue(null);
		await User.findByClerkId("clerk_1");
		await User.findByGuestSessionId("sess");
		expect(User.findOne).toHaveBeenCalled();
	});

	it("createFromClerk", async () => {
		const created = { id: "u1" } as User;
		jest.spyOn(User, "create").mockResolvedValueOnce(created);
		const u = await User.createFromClerk({
			id: "c1",
			emailAddresses: [{ emailAddress: "NEW@X.COM" }],
			firstName: "N",
		});
		expect(u).toBe(created);
		expect(User.create).toHaveBeenCalled();
	});

	it("createGuestUser", async () => {
		jest.spyOn(User, "create").mockResolvedValue({} as User);
		await User.createGuestUser("G@G.COM", "sid");
		expect(User.create).toHaveBeenCalled();
	});

	it("convertToRegistered and updateLastLogin", async () => {
		const update = jest.fn().mockResolvedValue(undefined);
		const u = User.build({
			email: "old@b.com",
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			isGuest: true,
			preferences: {
				emailNotifications: false,
				smsNotifications: false,
				marketingEmails: false,
				adminAlerts: false,
				orderNotifications: false,
			},
			tags: [],
			createdAt: new Date(),
		});
		u.update = update;
		await u.convertToRegistered({
			id: "clerk",
			emailAddresses: [{ emailAddress: "NEW@B.COM" }],
		});
		await u.updateLastLogin();
		expect(update).toHaveBeenCalled();
	});
});
