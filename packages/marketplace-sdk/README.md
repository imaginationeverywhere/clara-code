# @claracode/marketplace-sdk

Build Talents for the [Clara Talent Agency](https://talent.claracode.ai).

## Requirements

- Active [Clara Developer Program](https://developers.claracode.ai/program) membership ($99/year)
- Access to the Clara private registry

## Installation

```bash
# Authenticate with the Clara registry (one-time setup)
npm login --registry https://registry.claracode.ai

# Install the SDK
npm install @claracode/marketplace-sdk
```

## Quick Start

```typescript
import { defineTalent, verifyClaraServiceToken, parseClaraContext } from "@claracode/marketplace-sdk";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";

// 1. Define your Talent manifest
export const manifest = defineTalent({
	name: "my-talent",
	displayName: "My Talent",
	description: "Does something useful by voice.",
	category: "productivity",
	voiceCommands: [
		{
			pattern: "do {thing}",
			description: "Do a thing",
			examples: ["do my laundry", "do the thing"],
		},
	],
	pricingType: "free",
});

// 2. Set up your Apollo subgraph server
const server = new ApolloServer({
	schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

// 3. Verify Clara service tokens on every request
const middleware = expressMiddleware(server, {
	context: async ({ req }) => {
		const token = req.headers["x-clara-service-token"] as string;
		if (!verifyClaraServiceToken(token)) {
			throw new Error("Unauthorized");
		}
		return { claraContext: parseClaraContext(req.headers) };
	},
});
```

## Environment Variables

```bash
CLARA_SERVICE_TOKEN=   # Provided in your Clara Developer Dashboard
```

## Submitting Your Talent

Use the Clara CLI to submit your manifest for review:

```bash
npx clara talent submit
```

See the [developer documentation](https://developers.claracode.ai/docs) for the full submission guide.
