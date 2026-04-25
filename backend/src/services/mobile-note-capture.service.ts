import { type MobileStructuredSpec, MobileUpdateRequest } from "@/models/MobileUpdateRequest";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";
import { platformStandards } from "@/services/platform-standards.service";
import { interpretTranscriptToMobileSpec } from "@/services/voice-spec-interpreter.service";

export interface NoteCaptureInput {
	deploymentId: string;
	siteOwnerUserId: string;
	platform: "ios" | "android" | "both";
	rawVoiceTranscript: string;
}

export class MobileNoteCaptureService {
	async captureFromVoice(input: NoteCaptureInput): Promise<MobileUpdateRequest> {
		const deployment = await SiteAgentDeployment.findByPk(input.deploymentId);
		if (!deployment) throw new Error("deployment_not_found");
		if (deployment.siteOwnerUserId !== input.siteOwnerUserId) {
			throw new Error("not_site_owner");
		}

		const spec = (await interpretTranscriptToMobileSpec(
			input.rawVoiceTranscript,
			deployment,
		)) as MobileStructuredSpec & { category: string };

		const category = typeof spec.category === "string" && spec.category.length > 0 ? spec.category : "behavior";
		const validation = await platformStandards.validate(spec.description, category);
		if (!validation.approved) {
			throw new Error(`platform_rejected:${validation.rejectionReason ?? "rejected"}`);
		}

		return await MobileUpdateRequest.create({
			deploymentId: input.deploymentId,
			siteOwnerUserId: input.siteOwnerUserId,
			heruSlug: deployment.heruSlug,
			platform: input.platform,
			rawVoiceTranscript: input.rawVoiceTranscript,
			agentInterpretation: spec.restatement,
			structuredSpec: { ...spec, description: validation.sanitizedInstruction ?? spec.description },
			priority: spec.priority_guess,
			status: "pending_review",
		});
	}

	async approve(requestId: string, approverId: string, targetRelease?: string | null): Promise<void> {
		const [affected] = await MobileUpdateRequest.update(
			{ status: "approved", approvedAt: new Date(), targetRelease: targetRelease ?? null },
			{ where: { id: requestId, siteOwnerUserId: approverId } },
		);
		if (affected === 0) throw new Error("not_found");
	}

	async reject(requestId: string, approverId: string, reason: string): Promise<void> {
		const [affected] = await MobileUpdateRequest.update(
			{ status: "rejected", rejectedReason: reason },
			{ where: { id: requestId, siteOwnerUserId: approverId } },
		);
		if (affected === 0) throw new Error("not_found");
	}

	async markShipped(requestId: string, siteOwnerUserId: string): Promise<void> {
		const [affected] = await MobileUpdateRequest.update(
			{ status: "shipped", shippedAt: new Date() },
			{ where: { id: requestId, siteOwnerUserId } },
		);
		if (affected === 0) throw new Error("not_found");
	}

	async listPendingForOwner(siteOwnerUserId: string): Promise<MobileUpdateRequest[]> {
		return await MobileUpdateRequest.findAll({
			where: { siteOwnerUserId, status: "pending_review" },
			order: [["createdAt", "DESC"]],
		});
	}
}

export const mobileNoteCapture = new MobileNoteCaptureService();
