"use client";

import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Lazy singleton — not instantiated at module evaluation time, only when first
// requested in a browser context. Avoids Apollo prerender error during Next.js
// static generation (module-level `new ApolloClient()` fails in Node.js env).
let _client: ApolloClient<object> | null = null;

function buildClient(): ApolloClient<object> {
	const httpLink = createHttpLink({
		uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3031/graphql",
	});

	const authLink = setContext((_, { headers }) => {
		if (typeof window === "undefined") return { headers };
		const token = (window as Window & { __clerk_token?: string }).__clerk_token ?? "";
		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : "",
			},
		};
	});

	return new ApolloClient({
		link: authLink.concat(httpLink),
		cache: new InMemoryCache(),
	});
}

export function getApolloClient(): ApolloClient<object> {
	if (!_client) {
		_client = buildClient();
	}
	return _client;
}

// Backward-compat export used by ApolloProvider.tsx
export const apolloClient = new Proxy({} as ApolloClient<object>, {
	get(_target, prop) {
		return getApolloClient()[prop as keyof ApolloClient<object>];
	},
});

declare global {
	interface Window {
		__clerk_token?: string;
	}
}
