import { AgentTemplate } from "@/models/AgentTemplate";
import { UserAgent } from "@/models/UserAgent";
import { configAgentService } from "@/services/config-agent.service";
import { voiceCloneService } from "@/services/voice-clone.service";

jest.mock("@/models/UserAgent");
jest.mock("@/models/AgentTemplate");
jest.mock("@/services/voice-clone.service", () => ({
	voiceCloneService: {
		cloneFromSample: jest.fn(),
	},
}));

const mockUserAgent = UserAgent as jest.Mocked<typeof UserAgent>;
const mockTemplate = AgentTemplate as jest.Mocked<typeof AgentTemplate>;
const mockClone = jest.mocked(voiceCloneService.cloneFromSample);

describe("ConfigAgentService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUserAgent.count.mockResolvedValue(0);
		mockUserAgent.findOne.mockResolvedValue(null);
		mockUserAgent.create.mockImplementation(async (values) => {
			const attrs = (values ?? {}) as Record<string, unknown>;
			return { ...attrs, id: "u1" } as UserAgent;
		});
		mockTemplate.findByPk.mockResolvedValue({
			id: "frontend-engineer",
			soulMdTemplate: "You are {AGENT_NAME}, engineer.",
			suggestedSkills: [
				{ id: "a", name: "A" },
				{ id: "b", name: "B" },
			],
		} as unknown as AgentTemplate);
		mockClone.mockResolvedValue("cloned-voice-id");
	});

	it("creates a user agent with composed soul", async () => {
		const row = await configAgentService.configure({
			userId: "u",
			tier: "pro",
			templateId: "frontend-engineer",
			name: "Pat",
			voice: { source: "library", voiceId: "clara-default" },
			skillIds: ["a"],
		});
		expect(row.soulMd).toContain("Pat");
		expect(mockUserAgent.create).toHaveBeenCalled();
	});

	it("rejects when harness agent cap reached for tier", async () => {
		mockUserAgent.count.mockResolvedValue(6);
		await expect(
			configAgentService.configure({
				userId: "u",
				tier: "pro",
				templateId: "frontend-engineer",
				name: "Pat",
				voice: { source: "library", voiceId: "clara-default" },
				skillIds: ["a"],
			}),
		).rejects.toThrow(/harness_limit_reached/);
	});

	it("rejects when talent count exceeds talentsPerAgent for tier", async () => {
		await expect(
			configAgentService.configure({
				userId: "u",
				tier: "basic",
				templateId: "frontend-engineer",
				name: "Pat",
				voice: { source: "library", voiceId: "clara-default" },
				skillIds: ["a", "b", "c", "d", "e", "f"],
			}),
		).rejects.toThrow(/talents_per_agent_exceeded/);
	});

	it("clones voice via voiceCloneService when voice.source is clone", async () => {
		await configAgentService.configure({
			userId: "u",
			tier: "pro",
			templateId: "frontend-engineer",
			name: "Pat",
			voice: { source: "clone", audioBase64: "AAA" },
			skillIds: ["a"],
		});
		expect(mockClone).toHaveBeenCalledWith("u", "AAA");
	});

	it("retires agent via soft delete", async () => {
		const up = { update: jest.fn() };
		mockUserAgent.findOne.mockResolvedValue({ update: up.update, id: "x" } as never);
		await configAgentService.retireAgent("u", "x");
		expect(up.update).toHaveBeenCalledWith({ isActive: false });
	});
});
