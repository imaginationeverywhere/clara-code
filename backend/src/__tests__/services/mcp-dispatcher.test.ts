import axios from "axios";
import { AgentMcpConnection } from "@/models/AgentMcpConnection";
import { mcpCredsToCiphertext } from "@/services/mcp-credential-vault.service";
import { McpDispatcher } from "@/services/mcp-dispatcher.service";

jest.mock("axios", () => ({
	__esModule: true,
	default: { post: jest.fn() },
}));

const axiosPost = jest.mocked(axios.post);

describe("McpDispatcher#callTool", () => {
	const disp = new McpDispatcher();
	const userId = "mcp-dispatch-user";
	const ctx = {
		userId,
		agentId: "a1",
		sessionId: "s",
		turnId: "t",
		tier: "pro",
		metadata: {} as Record<string, unknown>,
	};

	let findAllSpy: jest.SpyInstance;

	beforeAll(() => {
		findAllSpy = jest.spyOn(AgentMcpConnection, "findAll");
	});

	afterAll(() => {
		findAllSpy.mockRestore();
	});

	beforeEach(() => {
		axiosPost.mockReset();
		findAllSpy.mockReset();
	});

	it("throws when no connection exposes the tool", async () => {
		findAllSpy.mockResolvedValue([]);
		await expect(
			disp.callTool({
				ctx,
				agentId: "a1",
				toolName: "missing",
				toolInput: {},
			}),
		).rejects.toThrow("no_mcp_exposes_tool:missing");
	});

	it("POSTs to MCP endpoint and returns JSON", async () => {
		const enc = mcpCredsToCiphertext(userId, { token: "t" });
		findAllSpy.mockResolvedValue([
			{
				enabledTools: ["ping"],
				credentialsCiphertext: enc,
				mcpServer: {
					endpointUrl: "https://mcp.example",
					authScheme: "bearer",
				},
			},
		]);
		axiosPost.mockResolvedValue({ status: 200, data: { ok: true } });
		const out = await disp.callTool({
			ctx,
			agentId: "a1",
			toolName: "ping",
			toolInput: { a: 1 },
		});
		expect(out).toEqual({ ok: true });
		expect(axiosPost).toHaveBeenCalledWith(
			"https://mcp.example/tool/ping",
			{ input: { a: 1 } },
			expect.objectContaining({ timeout: 30_000 }),
		);
	});
});
