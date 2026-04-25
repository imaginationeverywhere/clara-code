import { runRoutingDistributionJob } from "@/jobs/routing-distribution-daily";
import { UsageEvent } from "@/models/UsageEvent";

jest.mock("@/utils/logger", () => ({ logger: { info: jest.fn(), error: jest.fn() } }));

describe("runRoutingDistributionJob", () => {
	it("aggregates and logs (mocked findAll)", async () => {
		const spy = jest.spyOn(UsageEvent, "findAll").mockResolvedValue([
			{ modelUsed: "gemma", requestCount: "10", totalCogs: "0.1" },
			{ modelUsed: "kimi", requestCount: "2", totalCogs: "0.02" },
		] as never);
		await expect(runRoutingDistributionJob()).resolves.toBeUndefined();
		spy.mockRestore();
	});
});
