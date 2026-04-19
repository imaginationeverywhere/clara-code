import { escapeHtml } from "@/emails/escape-html";

export function apiKeyCreatedEmail(
	displayName: string,
	keyPrefix: string,
): { subject: string; html: string; text: string } {
	const safeName = escapeHtml(displayName);
	const safePrefix = escapeHtml(keyPrefix);
	const subject = "Your Clara API key is ready";
	const text = `Hi ${displayName},\n\nYour Clara API key starting with ${keyPrefix} has been created.\n\nKeep it safe — anyone with this key can make requests on your behalf.\n\nIf you didn't create this key, delete it immediately from your dashboard: https://claracode.ai/dashboard\n\n— The Clara Code team`;
	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:#09090F;color:#D9D9D9;font-family:Inter,sans-serif;padding:40px 20px;margin:0">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:32px">
      <span style="font-size:18px;font-weight:700;color:#ffffff">Clara Code</span>
    </div>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 16px">API key created</h1>
    <p style="color:#B3B3B3;line-height:1.6;margin:0 0 16px">
      Hi ${safeName}, a new API key starting with <code style="background:#1E1410;padding:2px 6px;border-radius:4px;color:#ffffff;font-family:monospace">${safePrefix}...</code> was just created on your account.
    </p>
    <p style="color:#B3B3B3;line-height:1.6;margin:0 0 24px">
      Keep it safe — anyone with this key can make API requests on your behalf.
    </p>
    <a href="https://claracode.ai/dashboard" style="display:inline-block;background:#7C3AED;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
      View dashboard
    </a>
    <p style="margin-top:24px;font-size:13px;color:#8C8C8C">
      Didn't create this key? <a href="https://claracode.ai/dashboard" style="color:#7C3AED">Delete it immediately</a> from your dashboard.
    </p>
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #141414">
      <p style="font-size:12px;color:#4D4D4D;margin:0">
        Clara Code by Imagination Everywhere · <a href="https://claracode.ai/privacy" style="color:#4D4D4D">Privacy</a> · <a href="https://claracode.ai/terms" style="color:#4D4D4D">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>`;
	return { subject, html, text };
}
