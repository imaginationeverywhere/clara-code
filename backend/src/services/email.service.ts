import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { logger } from "@/utils/logger";

const SES_REGION = process.env.AWS_REGION ?? "us-east-1";
const FROM_ADDRESS = process.env.CLARA_EMAIL_FROM ?? "noreply@claracode.ai";

let sesClient: SESClient | null = null;

function getSES(): SESClient | null {
	if (!sesClient) {
		sesClient = new SESClient({ region: SES_REGION });
	}
	return sesClient;
}

export interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
	const ses = getSES();
	if (!ses) {
		logger.warn("SES client not available — skipping email send");
		return;
	}

	try {
		await ses.send(
			new SendEmailCommand({
				Source: FROM_ADDRESS,
				Destination: { ToAddresses: [opts.to] },
				Message: {
					Subject: { Data: opts.subject, Charset: "UTF-8" },
					Body: {
						Html: { Data: opts.html, Charset: "UTF-8" },
						Text: { Data: opts.text, Charset: "UTF-8" },
					},
				},
			}),
		);
		logger.info("Email queued for delivery", { subject: opts.subject });
	} catch (err) {
		logger.error("Failed to send email:", err);
	}
}
