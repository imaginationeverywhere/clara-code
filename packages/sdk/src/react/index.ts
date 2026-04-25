export { SiteOwnerPanel, type SiteOwnerPanelProps } from "./SiteOwnerPanel.js";
export { type NoteCaptureResult, useAgentNoteCapture } from "./useAgentNoteCapture.js";

export const MOBILE_CAPTURE_MODE_PROMPT = `
[MOBILE CAPTURE MODE]
When the SITE_OWNER requests a change that requires code, UI, or new features:
  1. Acknowledge warmly
  2. Restate the request in one clear sentence
  3. Tell them it's queued for next release
  4. Tell them they can review the spec in their dashboard
Do NOT pretend to make changes that require app submission.
Do NOT say "done" or "I've updated it" — those are misleading on mobile.
`.trim();
