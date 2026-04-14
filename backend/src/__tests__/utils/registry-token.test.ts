import axios from "axios";
import { fetchNpmTokenFromVerdaccio } from "@/utils/registry-token";

jest.mock("axios", () => ({
	__esModule: true,
	default: {
		put: jest.fn(),
	},
}));

describe("fetchNpmTokenFromVerdaccio", () => {
	const put = axios.put as jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.VERDACCIO_URL = "http://localhost:4873";
		process.env.VERDACCIO_NPM_USER = "clara";
		process.env.VERDACCIO_NPM_PASSWORD = "secret";
	});

	it("returns dev mock when password empty", async () => {
		process.env.VERDACCIO_NPM_PASSWORD = "";
		const t = await fetchNpmTokenFromVerdaccio();
		expect(t).toBe("dev-mock-registry-token");
		expect(put).not.toHaveBeenCalled();
	});

	it("returns token field from Verdaccio", async () => {
		put.mockResolvedValueOnce({ data: { token: "abc123" } });
		const t = await fetchNpmTokenFromVerdaccio();
		expect(t).toBe("abc123");
	});

	it("falls back to base64 on ok:true", async () => {
		put.mockResolvedValueOnce({ data: { ok: true } });
		const t = await fetchNpmTokenFromVerdaccio();
		expect(t).toBe(Buffer.from("clara:secret", "utf8").toString("base64"));
	});

	it("falls back to base64 on axios error", async () => {
		put.mockRejectedValueOnce(new Error("network"));
		const t = await fetchNpmTokenFromVerdaccio();
		expect(t).toBe(Buffer.from("clara:secret", "utf8").toString("base64"));
	});
});
