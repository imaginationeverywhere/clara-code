/**
 * When a free user hits the monthly voice exchange cap, Clara can speak this
 * (returned in API responses for TTS).
 */
export function buildConversionPrompt(exchangesUsed: number): string {
	return [
		`You've had ${exchangesUsed} conversations with Clara. I've shown you what I can do —`,
		`now let me actually build with you.`,
		``,
		`For $39/month, you get three agents who can build your whole website:`,
		`a frontend engineer, a backend engineer, and a DevOps specialist.`,
		`We pick up exactly where we left off — with memory of everything we've discussed.`,
		``,
		`Ready to start? → claracode.ai/pricing`,
	].join("\n");
}
