import { describe, expect, it } from "vitest";
import { CLI_INSTALL_PLACEHOLDER, MARKETING_GITHUB_REPO } from "@/lib/marketing-install-constants";

describe("marketing-install-constants", () => {
	it("points users at the real GitHub org repo", () => {
		expect(MARKETING_GITHUB_REPO).toBe("https://github.com/imaginationeverywhere/clara-code");
	});

	it("keeps a scoped CLI install placeholder (no npx monorepo-root)", () => {
		expect(CLI_INSTALL_PLACEHOLDER).toContain("@clara/cli");
		expect(CLI_INSTALL_PLACEHOLDER).not.toMatch(/npx github:/i);
	});
});
