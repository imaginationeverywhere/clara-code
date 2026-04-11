import { omitUndefined } from "@/utils/omit-undefined";

describe("omitUndefined", () => {
	it("removes keys whose value is undefined", () => {
		expect(omitUndefined({ a: 1, b: undefined, c: "x" })).toEqual({ a: 1, c: "x" });
	});

	it("keeps null and other falsy values", () => {
		expect(omitUndefined({ a: null, b: 0, c: "" })).toEqual({ a: null, b: 0, c: "" });
	});
});
