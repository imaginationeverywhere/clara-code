import { MobileUpdateRequest } from "@/models/MobileUpdateRequest";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";
import { mobileNoteCapture } from "@/services/mobile-note-capture.service";
import { platformStandards } from "@/services/platform-standards.service";
import { interpretTranscriptToMobileSpec } from "@/services/voice-spec-interpreter.service";

jest.mock("@/models/SiteAgentDeployment");
jest.mock("@/models/MobileUpdateRequest");
jest.mock("@/services/voice-spec-interpreter.service", () => ({
	interpretTranscriptToMobileSpec: jest.fn(),
}));
jest.mock("@/services/platform-standards.service", () => ({
	platformStandards: { validate: jest.fn() },
}));

const mockDep = SiteAgentDeployment as jest.Mocked<typeof SiteAgentDeployment>;
const mockSave = MobileUpdateRequest as jest.Mocked<typeof MobileUpdateRequest>;
const mockInterpret = jest.mocked(interpretTranscriptToMobileSpec);
const mockPlat = platformStandards as { validate: jest.Mock };

describe("MobileNoteCaptureService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockDep.findByPk.mockResolvedValue({
			id: "dep1",
			siteOwnerUserId: "u1",
			heruSlug: "fmo",
		} as SiteAgentDeployment);
		mockPlat.validate.mockResolvedValue({ approved: true, sanitizedInstruction: "safe desc" });
		mockInterpret.mockResolvedValue({
			restatement: "Add tipping",
			title: "Tipping screen",
			description: "Add tipping after checkout",
			acceptance_criteria: [],
			affected_screens: ["Checkout"],
			priority_guess: "normal",
			category: "new_feature",
		});
		mockSave.create.mockImplementation(async (attrs) => {
			return { id: "m1", ...attrs, agentInterpretation: "x" } as unknown as MobileUpdateRequest;
		});
	});

	it("captures, validates, and creates a row", async () => {
		const r = await mobileNoteCapture.captureFromVoice({
			deploymentId: "dep1",
			siteOwnerUserId: "u1",
			platform: "ios",
			rawVoiceTranscript: "add tip screen",
		});
		expect(r).toBeDefined();
		expect(mockPlat.validate).toHaveBeenCalled();
		expect(mockSave.create).toHaveBeenCalled();
	});

	it("throws when platform standards reject", async () => {
		mockPlat.validate.mockResolvedValue({ approved: false, rejectionReason: "no" });
		await expect(
			mobileNoteCapture.captureFromVoice({
				deploymentId: "dep1",
				siteOwnerUserId: "u1",
				platform: "ios",
				rawVoiceTranscript: "x",
			}),
		).rejects.toThrow(/platform_rejected/);
	});
});
