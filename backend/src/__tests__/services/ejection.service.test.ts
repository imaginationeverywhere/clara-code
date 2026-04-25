import { Ejection } from "@/models/Ejection";
import { Subscription } from "@/models/Subscription";
import { UserAgent } from "@/models/UserAgent";
import { UserVoiceClone } from "@/models/UserVoiceClone";
import { ejectionService } from "@/services/ejection.service";

jest.mock("@/lib/s3", () => ({
	presignGetObject: jest.fn().mockResolvedValue("https://signed.example/presign"),
	putZipObject: jest.fn().mockResolvedValue(undefined),
	getEjectionBucket: jest.fn().mockReturnValue("test-bucket"),
}));

jest.mock("@/models/ConversationTurn", () => ({
	ConversationTurn: { findAll: jest.fn().mockResolvedValue([]) },
}));

jest.mock("archiver", () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest mock factory
	const { PassThrough } = require("node:stream") as { PassThrough: typeof import("node:stream").PassThrough };
	return jest.fn(() => {
		const pass = new PassThrough();
		const append = jest.fn();
		const finalize = jest.fn().mockResolvedValue(undefined);
		return {
			pipe: jest.fn().mockReturnValue(undefined),
			on: jest.fn(),
			append,
			finalize: () => {
				setImmediate(() => {
					pass.end();
				});
				return finalize();
			},
		};
	});
});

describe("EjectionService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("rejects when monthly ejection cap reached for basic tier", async () => {
		jest.spyOn(Ejection, "count").mockResolvedValue(1);
		jest.spyOn(UserAgent, "findOne").mockResolvedValue({ id: "a1", userId: "u1" } as UserAgent);
		await expect(ejectionService.requestEjection("u1", "basic", "a1")).rejects.toThrow("ejection_cap_reached:1");
	});

	it("rejects free tier (cap 0)", async () => {
		jest.spyOn(Ejection, "count").mockResolvedValue(0);
		await expect(ejectionService.requestEjection("u1", "free", "a1")).rejects.toThrow(
			"ejection_not_available_on_tier",
		);
	});

	it("throws agent_not_found when no user agent", async () => {
		jest.spyOn(Ejection, "count").mockResolvedValue(0);
		jest.spyOn(UserAgent, "findOne").mockResolvedValue(null);
		await expect(ejectionService.requestEjection("u1", "pro", "missing")).rejects.toThrow("agent_not_found");
	});

	it("creates ejection when cap allows", async () => {
		jest.spyOn(Ejection, "count").mockResolvedValue(0);
		const ua = {
			id: "a1",
			userId: "u1",
			name: "Test",
			attachedSkills: [{ id: "1", name: "stripe" }],
			personalityTweaks: {},
			soulMd: "hello claude-3", // will be scrubbed in zip path by sanitize
			voiceId: "v1",
		} as UserAgent;
		jest.spyOn(UserAgent, "findOne").mockResolvedValue(ua);
		jest.spyOn(Subscription, "findOne").mockResolvedValue({ status: "active" } as Subscription);
		jest.spyOn(UserVoiceClone, "findByUserId").mockResolvedValue(null);
		const create = jest.spyOn(Ejection, "create").mockResolvedValue({ id: "e1" } as Ejection);

		await ejectionService.requestEjection("u1", "pro", "a1");
		expect(create).toHaveBeenCalled();
	});

	it("runFingerprintScan completes when scanners return empty (stubbed)", async () => {
		await expect(ejectionService.runFingerprintScan()).resolves.toBeUndefined();
	});
});
