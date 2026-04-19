import type { SendEmailCommand } from "@aws-sdk/client-ses";
import { apiKeyCreatedEmail } from "@/emails/api-key-created";
import { welcomeEmail } from "@/emails/welcome";
import { sendEmail } from "@/services/email.service";
import { logger } from "@/utils/logger";

jest.mock("@/utils/logger", () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	},
}));

const sendMock = jest.fn();

jest.mock("@aws-sdk/client-ses", () => {
	const actual = jest.requireActual("@aws-sdk/client-ses") as typeof import("@aws-sdk/client-ses");
	return {
		...actual,
		SESClient: jest.fn().mockImplementation(() => ({
			send: sendMock,
		})),
	};
});

describe("sendEmail", () => {
	beforeEach(() => {
		sendMock.mockReset();
		sendMock.mockResolvedValue({});
		jest.clearAllMocks();
	});

	it("calls ses.send once with expected command shape", async () => {
		await sendEmail({
			to: "user@example.com",
			subject: "Hello",
			html: "<p>Hi</p>",
			text: "Hi",
		});
		expect(sendMock).toHaveBeenCalledTimes(1);
		const cmd = sendMock.mock.calls[0][0] as SendEmailCommand;
		expect(cmd.input.Destination?.ToAddresses?.[0]).toBe("user@example.com");
		expect(cmd.input.Message?.Subject?.Data).toBe("Hello");
		expect(logger.info).toHaveBeenCalledWith("Email queued for delivery", { subject: "Hello" });
	});

	it("logs error and does not throw when SES send fails", async () => {
		sendMock.mockRejectedValueOnce(new Error("network"));
		await expect(sendEmail({ to: "a@b.com", subject: "S", html: "h", text: "t" })).resolves.toBeUndefined();
		expect(logger.error).toHaveBeenCalled();
	});
});

describe("welcomeEmail", () => {
	it("interpolates displayName in subject and bodies", () => {
		const { subject, html, text } = welcomeEmail("Alex");
		expect(subject).toContain("Welcome");
		expect(text).toContain("Alex");
		expect(html).toContain("Alex");
	});
});

describe("apiKeyCreatedEmail", () => {
	it("includes key prefix and dashboard link in html", () => {
		const { html, text } = apiKeyCreatedEmail("Sam", "sk-clara-test");
		expect(text).toContain("sk-clara-test");
		expect(html).toContain("sk-clara-test");
		expect(html).toContain("claracode.ai/dashboard");
	});
});
