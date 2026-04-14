/** REST API origin derived from GraphQL URL (same host, no /graphql). */
export function getRestApiBaseUrl(): string {
	const g = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3031/graphql";
	return g.replace(/\/graphql\/?$/, "");
}
