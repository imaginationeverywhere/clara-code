# GraphQL Implementation Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --graphql`

---

## CRITICAL RULES

### 1. DataLoader for every relationship — NO N+1 queries

**FORBIDDEN:**
```typescript
// ❌ N+1 — fetches user for EVERY order in a list
const resolvers = {
  Order: {
    user: async (order) => await User.findByPk(order.userId),
  },
};
```

**REQUIRED:**
```typescript
// ✅ DataLoader batches all user lookups into one query
import DataLoader from "dataloader";

const userLoader = new DataLoader(async (ids: readonly string[]) => {
  const users = await User.findAll({ where: { id: ids } });
  return ids.map(id => users.find(u => u.id === id) ?? null);
});

const resolvers = {
  Order: {
    user: async (order, _, ctx) => ctx.loaders.user.load(order.userId),
  },
};
```

DataLoaders belong in `context` — one instance per request, never singleton.

---

### 2. Auth guard on EVERY protected resolver

**FORBIDDEN:**
```typescript
me: async (_, __, ctx) => {
  return await User.findByPk(ctx.auth.userId); // ❌ crashes if unauthenticated
}
```

**REQUIRED:**
```typescript
// ✅ Always check first — throw AuthenticationError, not generic Error
me: async (_, __, ctx) => {
  if (!ctx.auth?.userId) throw new AuthenticationError("Authentication required");
  return await User.findByPk(ctx.auth.userId);
},
```

Use `AuthenticationError` for missing auth, `ForbiddenError` for wrong role.

---

### 3. Naming conventions (enforced — no exceptions)

| Element | Convention | Example |
|---------|-----------|---------|
| Types | PascalCase | `UserProfile`, `OrderItem` |
| Fields | camelCase | `firstName`, `createdAt` |
| Queries | camelCase verb | `getUser`, `listOrders` |
| Mutations | camelCase verb | `createUser`, `updateOrder` |
| Input types | PascalCase + `Input` | `CreateUserInput` |
| Enums | SCREAMING_SNAKE | `ORDER_STATUS` |
| Subscriptions | camelCase | `orderUpdated` |

---

### 4. Never expose internal IDs or sensitive fields directly

```graphql
# ❌ Exposes internal DB keys and sensitive data
type User {
  internalId: Int!       # DB auto-increment — never expose
  stripeCustomerId: String  # internal billing key
  passwordHash: String!  # never
}

# ✅ Use opaque IDs, omit sensitive fields
type User {
  id: ID!                # opaque global ID
  email: String!
  tier: UserTier!
}
```

---

### 5. Heru-specific tech doc required

Each Heru MUST have `docs/standards/graphql.md` that documents:
- Schema file location
- Which resolvers exist and what auth level they require
- DataLoader setup location in context
- Any custom scalars in use
- Federation subgraph URLs (if federated)

If `docs/standards/graphql.md` does not exist, create it as part of this prompt.

---

### 6. Validation before every deploy

```bash
npm run graphql:validate   # Must pass with 0 errors before merge
```

If `graphql:validate` is not in `package.json`, add it.

---

## Federation Subgraph Pattern (Clara Platform)

When this Heru is a subgraph in Apollo Federation:

```typescript
// schema must include federation directives
const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

  type User @key(fields: "id") {
    id: ID!
    # subgraph-specific fields only
  }
`;

// Reference resolvers for entities owned by other subgraphs
const resolvers = {
  User: {
    __resolveReference: async ({ id }, ctx) => ctx.loaders.user.load(id),
  },
};
```
