import type { ClaraUser } from "@/middleware/api-key-auth";

export interface ClaraCoreContext {
	user: ClaraUser;
	authorization: string | undefined;
}
