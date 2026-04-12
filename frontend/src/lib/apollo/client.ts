import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
	uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3031/graphql",
});

const authLink = setContext((_, { headers }) => {
	if (typeof window === "undefined") return { headers };
	const token = window.__clerk_token ?? "";
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

export const apolloClient = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});

declare global {
	interface Window {
		__clerk_token?: string;
	}
}
