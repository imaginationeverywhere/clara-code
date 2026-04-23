/**
 * Browser-safe entry: `postVoiceConverse` only (no `fs` / greeting cache).
 * Use this path from Tauri `webview` and other bundles that must not pull Node `fs`.
 */

export {
	type ConverseFailure,
	type ConverseRequestBody,
	type ConverseResult,
	type ConverseSuccess,
	postVoiceConverse,
	resolveConverseUrl,
} from "./converse.js";
