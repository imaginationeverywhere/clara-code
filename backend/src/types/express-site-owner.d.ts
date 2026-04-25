import type { SiteAgentDeployment } from "@/models/SiteAgentDeployment";

declare global {
	namespace Express {
		interface Request {
			deployment?: SiteAgentDeployment;
		}
	}
}
