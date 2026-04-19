/** Placeholder for gateway URL prompts; configure via `HERMES_GATEWAY_URL` or Secret Storage. */
export const GATEWAY_URL_PLACEHOLDER = "https://your-gateway.example.com";

/** SecretStorage key for optional dev override of gateway URL (never use settings.json). */
export const GATEWAY_SECRET_KEY = "clara.gatewayUrl";

export function gatewayUrlFromEnv(): string {
	return process.env.HERMES_GATEWAY_URL?.trim() ?? "";
}
