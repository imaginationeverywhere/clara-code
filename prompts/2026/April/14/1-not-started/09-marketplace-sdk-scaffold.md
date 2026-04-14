# Marketplace SDK Scaffold — `@claracode/marketplace-sdk`

**Source:** `docs/auto-claude/CLARA_TALENT_AGENCY_ARCHITECTURE.md` — read this document before writing any code.
**Depends on:** Prompt 04 must be merged (Verdaccio private registry must be running); Prompt 07 must be merged (Talent Registry types defined)
**Branch:** `prompt/2026-04-14/09-marketplace-sdk-scaffold`
**Scope:** `packages/marketplace-sdk/` (new package in this monorepo)

---

## Context

`@claracode/marketplace-sdk` is the npm package Talent developers install to build their GraphQL subgraphs. It is distributed through the private registry (`registry.claracode.ai`) — NOT public npm. Access requires an active Developer Program membership ($99/year).

This SDK is intentionally minimal. It does three things:
1. Verifies incoming Clara service tokens on subgraph requests (auth handshake)
2. Provides TypeScript types for Talent manifests and voice command schemas
3. Exports a `defineTalent()` helper that validates the manifest at build time

Do NOT put any business logic in this SDK beyond auth verification and type safety. The goal is to make it trivial for a developer to verify "this request is legitimately from Clara's gateway."

The SDK must expose only Clara-branded interfaces. No internal service names in any type name, error message, or comment.

---

## Required Work

### 1. Create the package

Create `packages/marketplace-sdk/` with:

```
packages/marketplace-sdk/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Public exports
│   ├── types.ts          # TalentManifest, VoiceCommandPattern, etc.
│   ├── auth.ts           # verifyClaraServiceToken
│   └── define.ts         # defineTalent()
├── test/
│   └── auth.test.ts
└── README.md
```

### 2. `package.json`

```json
{
  "name": "@claracode/marketplace-sdk",
  "version": "0.1.0",
  "description": "Build Talents for the Clara Talent Agency",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "test": "jest",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "publishConfig": {
    "registry": "https://registry.claracode.ai"
  }
}
```

Note: `publishConfig.registry` ensures this package only publishes to and installs from the Clara private registry, never public npm.

### 3. `src/types.ts`

```typescript
/**
 * Clara Marketplace SDK — Type Definitions
 *
 * These types define the shape of a Talent manifest submitted to
 * the Clara Talent Agency. All voice commands are reviewed before
 * a Talent is approved and listed.
 */

export type TalentCategory =
  | "productivity"
  | "data"
  | "communication"
  | "developer-tools"
  | "other";

/**
 * A voice command pattern that this Talent handles.
 *
 * @example
 * {
 *   pattern: "show my {resource}",
 *   description: "Display a list of the user's resources",
 *   examples: ["show my pull requests", "show my open issues"]
 * }
 */
export interface VoiceCommandPattern {
  /** Pattern string. Use {variable} for user-supplied values. */
  pattern: string;
  /** Short description of what this command does. */
  description: string;
  /** 2-4 concrete example phrases. */
  examples: string[];
}

/**
 * The manifest that defines a Talent on the Clara Talent Agency.
 *
 * Pass this to `defineTalent()` to get build-time validation.
 */
export interface TalentManifest {
  /** Unique slug. Lowercase, hyphens only. e.g. "github-prs" */
  name: string;
  /** Human-readable display name. e.g. "GitHub Pull Requests" */
  displayName: string;
  /** Short description shown in the Talent marketplace. 160 chars max. */
  description: string;
  /** Category for marketplace browsing. */
  category: TalentCategory;
  /** Voice commands this Talent handles. At least one required. */
  voiceCommands: VoiceCommandPattern[];
  /** Whether this Talent is free or paid. */
  pricingType: "free" | "paid";
  /** Monthly price in USD. Required when pricingType is "paid". */
  priceMonthly?: number;
}

/**
 * Context passed by Clara's gateway to your subgraph on each request.
 * Delivered via HTTP headers — parse with `parseClaraContext()`.
 */
export interface ClaraRequestContext {
  /** Scoped, non-reversible identifier for this subscriber session. NOT the user's real ID. */
  sessionToken: string;
  /** The voice command phrase that triggered this Talent. */
  voiceCommand: string;
  /** ISO 8601 timestamp of the request. */
  requestedAt: string;
}
```

### 4. `src/auth.ts`

```typescript
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify that an incoming request is legitimately from Clara's gateway.
 *
 * Clara sends a service token in the `x-clara-service-token` header on every
 * subgraph request. Verify this token before processing any request.
 *
 * @param token - The value of the `x-clara-service-token` header
 * @returns true if the token is valid, false otherwise
 *
 * @example
 * // In your Apollo Server context function:
 * context: async ({ req }) => {
 *   const token = req.headers['x-clara-service-token'] as string;
 *   if (!verifyClaraServiceToken(token)) {
 *     throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
 *   }
 *   return { claraContext: parseClaraContext(req.headers) };
 * }
 */
export function verifyClaraServiceToken(token: string): boolean {
  const expectedToken = process.env.CLARA_SERVICE_TOKEN;
  if (!expectedToken) {
    throw new Error(
      "CLARA_SERVICE_TOKEN environment variable is not set. " +
      "Set it to the value provided in your Clara Developer Dashboard."
    );
  }
  if (!token || typeof token !== "string") return false;

  // Constant-time comparison to prevent timing attacks
  try {
    const expected = Buffer.from(expectedToken, "utf8");
    const provided = Buffer.from(token, "utf8");
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

/**
 * Parse the Clara request context from incoming headers.
 * Call this after `verifyClaraServiceToken` returns true.
 */
export function parseClaraContext(headers: Record<string, string | string[] | undefined>): import("./types").ClaraRequestContext {
  return {
    sessionToken: (headers["x-clara-session-token"] as string) ?? "",
    voiceCommand: (headers["x-clara-voice-command"] as string) ?? "",
    requestedAt: (headers["x-clara-requested-at"] as string) ?? new Date().toISOString(),
  };
}
```

### 5. `src/define.ts`

```typescript
import type { TalentManifest } from "./types";

/**
 * Define and validate a Talent manifest at build time.
 *
 * This is a no-op at runtime — it exists purely for TypeScript validation
 * and to make manifest declarations readable and self-documenting.
 *
 * @example
 * export const manifest = defineTalent({
 *   name: "github-prs",
 *   displayName: "GitHub Pull Requests",
 *   description: "Manage your GitHub pull requests by voice.",
 *   category: "developer-tools",
 *   voiceCommands: [
 *     {
 *       pattern: "show my pull requests",
 *       description: "List open pull requests",
 *       examples: ["show my pull requests", "show my open PRs"],
 *     },
 *   ],
 *   pricingType: "free",
 * });
 */
export function defineTalent(manifest: TalentManifest): TalentManifest {
  // Build-time validation
  if (!manifest.name || !/^[a-z0-9-]+$/.test(manifest.name)) {
    throw new Error(
      `Talent name "${manifest.name}" is invalid. Use lowercase letters, numbers, and hyphens only.`
    );
  }
  if (!manifest.voiceCommands || manifest.voiceCommands.length === 0) {
    throw new Error("A Talent must declare at least one voice command.");
  }
  if (manifest.pricingType === "paid" && !manifest.priceMonthly) {
    throw new Error("Paid Talents must specify priceMonthly.");
  }
  if (manifest.description && manifest.description.length > 160) {
    throw new Error("Talent description must be 160 characters or fewer.");
  }
  return manifest;
}
```

### 6. `src/index.ts` — Public exports

```typescript
export { verifyClaraServiceToken, parseClaraContext } from "./auth";
export { defineTalent } from "./define";
export type {
  TalentManifest,
  VoiceCommandPattern,
  TalentCategory,
  ClaraRequestContext,
} from "./types";
```

### 7. Tests

Create `packages/marketplace-sdk/test/auth.test.ts`:

```typescript
import { verifyClaraServiceToken } from "../src/auth";

describe("verifyClaraServiceToken", () => {
  beforeEach(() => {
    process.env.CLARA_SERVICE_TOKEN = "test-service-token-abc123";
  });

  afterEach(() => {
    delete process.env.CLARA_SERVICE_TOKEN;
  });

  it("returns true for the correct token", () => {
    expect(verifyClaraServiceToken("test-service-token-abc123")).toBe(true);
  });

  it("returns false for an incorrect token", () => {
    expect(verifyClaraServiceToken("wrong-token")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(verifyClaraServiceToken("")).toBe(false);
  });

  it("throws if CLARA_SERVICE_TOKEN env var is not set", () => {
    delete process.env.CLARA_SERVICE_TOKEN;
    expect(() => verifyClaraServiceToken("any-token")).toThrow("CLARA_SERVICE_TOKEN");
  });

  it("returns false for tokens of different lengths (timing-safe)", () => {
    expect(verifyClaraServiceToken("test-service-token-abc123-extra")).toBe(false);
  });
});
```

Create `packages/marketplace-sdk/test/define.test.ts`:

```typescript
import { defineTalent } from "../src/define";

describe("defineTalent", () => {
  const validManifest = {
    name: "github-prs",
    displayName: "GitHub Pull Requests",
    description: "Manage PRs by voice.",
    category: "developer-tools" as const,
    voiceCommands: [{ pattern: "show my pull requests", description: "List open PRs", examples: ["show my PRs"] }],
    pricingType: "free" as const,
  };

  it("returns manifest unchanged for valid input", () => {
    expect(defineTalent(validManifest)).toEqual(validManifest);
  });

  it("throws for invalid name (uppercase)", () => {
    expect(() => defineTalent({ ...validManifest, name: "GitHub-PRs" })).toThrow("invalid");
  });

  it("throws for empty voiceCommands", () => {
    expect(() => defineTalent({ ...validManifest, voiceCommands: [] })).toThrow("voice command");
  });

  it("throws for paid talent without priceMonthly", () => {
    expect(() => defineTalent({ ...validManifest, pricingType: "paid" })).toThrow("priceMonthly");
  });

  it("throws for description over 160 chars", () => {
    expect(() => defineTalent({ ...validManifest, description: "x".repeat(161) })).toThrow("160 characters");
  });
});
```

### 8. README

Create `packages/marketplace-sdk/README.md`:

```markdown
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
npx @clara/cli talent submit
```

See the [developer documentation](https://developers.claracode.ai/docs) for the full submission guide.
```

---

## Acceptance Criteria

- [ ] `packages/marketplace-sdk/` exists with correct structure
- [ ] `pnpm -C packages/marketplace-sdk run build` succeeds — generates `dist/`
- [ ] `pnpm -C packages/marketplace-sdk run test` passes — all tests pass
- [ ] `pnpm -C packages/marketplace-sdk run type-check` — zero TypeScript errors
- [ ] `verifyClaraServiceToken()` uses constant-time comparison
- [ ] `defineTalent()` validates name format, voice commands, paid pricing
- [ ] No internal service names appear in any exported type, error message, or comment
- [ ] `publishConfig.registry` points to `https://registry.claracode.ai` — NOT npmjs.com

## Do NOT

- Do not export anything that leaks internal infrastructure names
- Do not add business logic beyond token verification and type validation
- Do not publish to public npm — `publishConfig.registry` must be the Clara registry
- Do not add dependencies that would bloat the SDK — only `crypto` (Node built-in) is needed
