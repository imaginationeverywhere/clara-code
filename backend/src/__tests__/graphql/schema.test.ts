import { print } from "graphql";
import { typeDefs } from "@/graphql/schema/index";

describe("GraphQL schema", () => {
	it("exports non-empty type definitions", () => {
		expect(typeDefs).toBeDefined();
		expect(print(typeDefs)).toContain("type Query");
	});
});
