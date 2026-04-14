# Frontend Stack Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --frontend`

**Canonical stack:** Next.js 16 · TypeScript (strict) · Tailwind CSS · Apollo Client · Clerk · Redux-Persist · ShadCN UI

This standard enforces the exact technology choices, package versions, file structure, and patterns for ALL Quik Nation frontend projects. Any prompt executed with `--frontend` MUST produce code matching this stack exactly — no substitutions.

---

## CRITICAL RULES

### 1. Stack — exact packages and versions

```json
// package.json dependencies (frontend workspace)
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "@clerk/nextjs": "^6.0.0",
    "@apollo/client": "^3.11.0",
    "graphql": "^16.9.0",
    "@reduxjs/toolkit": "^2.3.0",
    "redux-persist": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "@shadcn/ui": "latest",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0"
  }
}

// ❌ Pages Router — always App Router
// ❌ React Query — always Apollo Client for GraphQL
// ❌ Zustand / MobX — always Redux Toolkit + Redux-Persist
// ❌ CSS Modules / styled-components — always Tailwind CSS
// ❌ Chakra UI / Material UI — always ShadCN UI + Tailwind
```

---

### 2. TypeScript — strict mode, always

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
// ❌ strict: false
// ❌ any types without explicit comment justification
// ❌ // @ts-ignore (use // @ts-expect-error with explanation)
```

---

### 3. File structure — App Router, strict layout

```
frontend/
├── src/
│   ├── app/                          # App Router pages
│   │   ├── layout.tsx                # Root layout — Providers wrapper
│   │   ├── page.tsx                  # Landing/home
│   │   ├── (auth)/                   # Auth group (sign-in, sign-up)
│   │   │   ├── sign-in/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   ├── dashboard/                # Protected app pages
│   │   │   └── page.tsx
│   │   ├── account/                  # User account (profile, wallet, settings)
│   │   │   ├── profile/page.tsx
│   │   │   └── wallet/page.tsx
│   │   └── admin/                    # Admin panel (role-gated)
│   │       ├── layout.tsx            # Admin auth guard
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                       # ShadCN components (auto-generated, don't edit)
│   │   ├── layout/                   # Navbar, Sidebar, Footer
│   │   ├── profile/                  # ProfileWidget, WalletSummaryCard
│   │   └── [feature]/                # Feature-specific components
│   ├── lib/
│   │   ├── apollo-client.ts          # Apollo Client singleton + auth link
│   │   └── utils.ts                  # cn() and utility functions
│   ├── store/
│   │   ├── index.ts                  # Redux store + persistor
│   │   └── slices/                   # Redux Toolkit slices
│   ├── graphql/
│   │   ├── queries/                  # .graphql query files
│   │   └── mutations/                # .graphql mutation files
│   ├── types/                        # TypeScript type definitions
│   └── middleware.ts                 # Clerk middleware
├── public/
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

### 4. Apollo Client — singleton with Clerk token auth link

```typescript
// src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3031/graphql",
});

// Token getter is swapped in at runtime by AuthSetup (Clerk token)
let _getToken: (() => Promise<string | null>) | null = null;

const authLink = setContext(async (_, { headers }) => {
  const token = _getToken ? await _getToken() : null;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});

export function updateApolloClientAuth(getToken: () => Promise<string | null>) {
  _getToken = getToken;
}
```

---

### 5. Redux store — always with Redux-Persist

```typescript
// src/store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "preferences"],  // Only persist non-sensitive slices
  blacklist: ["auth"],                  // Never persist auth state — Clerk handles it
};

const rootReducer = combineReducers({
  cart:        cartSlice.reducer,
  preferences: preferencesSlice.reducer,
  ui:          uiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"] } }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ❌ Never persist auth tokens or Clerk session data
// ❌ Never put sensitive user data in Redux (wallet balance, PII)
```

---

### 6. Tailwind config — design tokens required

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      "#09090F",
          purple:  "#7C3AED",
          teal:    "#7BCDD8",
          success: "#10B981",
          surface: "#111118",
          border:  "rgba(255,255,255,0.1)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: { lg: "0.75rem", xl: "1rem", "2xl": "1.5rem" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

// ❌ Hardcoded hex values in className — always use brand-* tokens
// ❌ className="bg-[#09090F]" → className="bg-brand-bg"
```

---

### 7. Server vs client components — default server, opt-in client

```typescript
// ✅ Server component by default — no 'use client', can async/await
export default async function DashboardPage() {
  const data = await fetchDashboardData(); // Direct async call, no useEffect
  return <DashboardContent data={data} />;
}

// ✅ Client component — only when you need hooks, events, or browser APIs
"use client";
export function SearchBar() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// ❌ 'use client' on page components unless truly required
// ❌ Fetching data in useEffect on a page — use server components
// ❌ Passing non-serializable props from server to client components
```

---

### 8. next.config.ts — standard config

```typescript
// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    ppr: false, // enable when stable
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.clerk.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
    ],
  },
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },
};
export default config;
```

---

### Heru-specific tech doc required

Each Heru frontend MUST have `docs/standards/frontend.md` documenting:
- Next.js version in use
- GraphQL endpoint URL per environment
- Redux slices and which are persisted
- Custom Tailwind tokens beyond the platform defaults
- Any deviations from the standard stack (rare — document why)

If `docs/standards/frontend.md` does not exist, create it.
