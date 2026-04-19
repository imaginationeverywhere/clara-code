import { escapeHtml } from "@/emails/escape-html";

export function welcomeEmail(displayName: string): { subject: string; html: string; text: string } {
	const safe = escapeHtml(displayName);
	const subject = "Welcome to Clara Code";
	const text = `Hi ${displayName},\n\nWelcome to Clara Code — voice-first AI coding.\n\nGet started:\n1. Download the IDE extension from claracode.ai\n2. Create your API key in the dashboard\n3. Say "hey Clara" in your IDE\n\nQuestions? Reply to this email.\n\n— The Clara Code team`;
	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:#09090F;color:#D9D9D9;font-family:Inter,sans-serif;padding:40px 20px;margin:0">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:32px">
      <span style="font-size:18px;font-weight:700;color:#ffffff">Clara Code</span>
    </div>
    <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 16px">Welcome, ${safe}.</h1>
    <p style="color:#B3B3B3;line-height:1.6;margin:0 0 24px">
      You're in. Clara is a voice-first AI coding assistant that lives in your IDE.
    </p>
    <div style="margin:24px 0">
      <p style="color:#B3B3B3;font-weight:600;margin:0 0 12px">Get started in 3 steps:</p>
      <ol style="color:#B3B3B3;line-height:2;padding-left:20px;margin:0">
        <li>Download the Clara Code IDE extension from <a href="https://claracode.ai" style="color:#7C3AED">claracode.ai</a></li>
        <li>Create your API key in the <a href="https://claracode.ai/dashboard" style="color:#7C3AED">dashboard</a></li>
        <li>Say <strong style="color:#ffffff">"hey Clara"</strong> in your IDE</li>
      </ol>
    </div>
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
