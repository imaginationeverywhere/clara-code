import axios from "axios";
import { logger } from "@/utils/logger";

/**
 * Attempts npm login against Verdaccio and returns an opaque token or Base64 basic-auth for `.npmrc`.
 */
export async function fetchNpmTokenFromVerdaccio(): Promise<string> {
	const base = (process.env.VERDACCIO_URL ?? "http://127.0.0.1:4873").replace(/\/$/, "");
	const user = process.env.VERDACCIO_NPM_USER ?? "clara";
	const pass = process.env.VERDACCIO_NPM_PASSWORD ?? "";
	if (!pass) {
		return "dev-mock-registry-token";
	}

	try {
		const url = `${base}/-/user/org.couchdb.user:${encodeURIComponent(user)}`;
		const res = await axios.put<{ token?: string; ok?: boolean }>(
			url,
			{ name: user, password: pass },
			{ timeout: 8000, validateStatus: () => true },
		);
		const data = res.data;
		if (data && typeof data.token === "string" && data.token.length > 0) {
			return data.token;
		}
		if (data && data.ok === true) {
			return Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
		}
	} catch (error) {
		logger.warn("Verdaccio login failed; falling back to Basic auth token", error);
	}

	return Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
}
