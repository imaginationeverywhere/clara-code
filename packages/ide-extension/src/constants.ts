/**
 * The permanent public URL for Clara's LLM gateway. Bakes into every IDE install
 * so a fresh `clara-code` extension doesn't require user configuration. The
 * middleware backing this path ships from the Clara platform; transient 4xx/5xx
 * before it lands is expected.
 */
export const DEFAULT_GATEWAY_URL = "https://api.claracode.ai/hermes";

/** Placeholder for gateway URL prompts; configure via `CLARA_GATEWAY_URL` or Secret Storage. */
export const GATEWAY_URL_PLACEHOLDER = DEFAULT_GATEWAY_URL;

/** SecretStorage key for optional dev override of gateway URL (never use settings.json). */
export const GATEWAY_SECRET_KEY = "clara.gatewayUrl";

export function gatewayUrlFromEnv(): string {
	return process.env.CLARA_GATEWAY_URL?.trim() ?? "";
}

/**
 * Stable user-facing fix-hint. Used whenever the gateway is unreachable or returns
 * an error — never mentions internal service names.
 */
export const COMING_ONLINE_HINT =
	"Clara gateway is coming online. Run `Clara: Doctor` for status, or set CLARA_GATEWAY_URL to override.";
