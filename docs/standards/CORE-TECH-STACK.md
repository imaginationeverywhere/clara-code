# Core Technology Stack Standards
# QuikNation Development Guidelines

**Version:** 2.0.0
**Last Updated:** 2025-10-01
**Powered by:** Claude Sonnet 4.5

---

## Table of Contents
1. [Next.js 16 Standards](#nextjs-16-standards)
2. [TypeScript Standards](#typescript-standards)
3. [GraphQL Standards](#graphql-standards)
4. [Node.js & Express Standards](#nodejs--express-standards)
5. [PostgreSQL & Sequelize Standards](#postgresql--sequelize-standards)
6. [Tailwind CSS Standards](#tailwind-css-standards)
7. [Redux Persist Standards](#redux-persist-standards)
8. [Clerk Authentication Standards](#clerk-authentication-standards)
9. [Stripe Payment Standards](#stripe-payment-standards)
10. [React Native Standards](#react-native-standards)

---

## Next.js 16 Standards

### App Router Architecture (Required)
```typescript
// ✅ Correct: Use App Router (app/ directory)
src/app/
├── layout.tsx           // Root layout
├── page.tsx             // Home page
├── (auth)/              // Route groups
│   ├── login/page.tsx
│   └── signup/page.tsx
└── dashboard/
    ├── layout.tsx       // Nested layout
    └── page.tsx

// ❌ Incorrect: Pages Router (deprecated)
src/pages/
├── _app.tsx
├── index.tsx
└── dashboard.tsx
```

### Server vs Client Components
```typescript
// ✅ Server Component (default) - for data fetching
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json());

  return (
    <div>
      <h1>{product.name}</h1>
      <ClientCart product={product} />
    </div>
  );
}

// ✅ Client Component - for interactivity
'use client';

import { useState } from 'react';

export function ClientCart({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <button onClick={() => setQuantity(q => q + 1)}>
      Add to Cart ({quantity})
    </button>
  );
}
```

### Data Fetching Patterns
```typescript
// ✅ Server-side data fetching (preferred)
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache', // Static data
    // OR
    next: { revalidate: 3600 }, // ISR (revalidate every hour)
    // OR
    cache: 'no-store', // Dynamic data
  });
  return res.json();
}

// ✅ Parallel data fetching
async function Page() {
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts(),
  ]);
}

// ❌ Incorrect: Client-side fetching for initial load
'use client';
useEffect(() => {
  fetch('/api/data').then(...);
}, []);
```

### Route Handlers (API Routes)
```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Metadata & SEO
```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'QuikNation',
    template: '%s | QuikNation',
  },
  description: 'Build production-ready apps faster',
  openGraph: {
    title: 'QuikNation',
    description: 'Build production-ready apps faster',
    url: 'https://quiknation.com',
    siteName: 'QuikNation',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};
```

---

## TypeScript Standards

### Strict Mode (Required)
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Definitions
```typescript
// ✅ Use interfaces for objects
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ✅ Use types for unions, intersections, primitives
type Status = 'pending' | 'approved' | 'rejected';
type UserWithStatus = User & { status: Status };

// ✅ Generic types for reusability
interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

// ✅ Function types
type FetchUser = (id: string) => Promise<User>;

// ❌ Avoid 'any' - use 'unknown' for truly unknown types
const data: unknown = JSON.parse(response);
if (isUser(data)) {
  // Type guard
  console.log(data.name);
}
```

### Type Guards
```typescript
// ✅ Type guard functions
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// ✅ Use in conditional logic
if (isUser(data)) {
  console.log(data.email); // TypeScript knows data is User
}
```

---

## GraphQL Standards

### Schema Design
```graphql
# schema.graphql
type User {
  id: ID!
  name: String!
  email: String!
  createdAt: DateTime!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  published: Boolean!
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
}

input UpdateUserInput {
  name: String
  email: String
}

scalar DateTime
```

### Resolver Patterns (Backend)
```typescript
// src/graphql/resolvers/user.ts
import { GraphQLError } from 'graphql';

export const userResolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }, context: Context) => {
      // ✅ Always validate authentication
      if (!context.auth?.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // ✅ Use DataLoader to prevent N+1 queries
      return context.dataloaders.userLoader.load(id);
    },

    users: async (
      _: any,
      { limit = 10, offset = 0 }: { limit?: number; offset?: number },
      context: Context
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Unauthorized');
      }

      return context.db.user.findMany({
        take: limit,
        skip: offset,
      });
    },
  },

  Mutation: {
    createUser: async (
      _: any,
      { input }: { input: CreateUserInput },
      context: Context
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Unauthorized');
      }

      // ✅ Validate input
      if (!input.email.includes('@')) {
        throw new GraphQLError('Invalid email format', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      return context.db.user.create({ data: input });
    },
  },

  User: {
    // ✅ Field resolver for relationships
    posts: async (parent: User, _: any, context: Context) => {
      return context.dataloaders.postsByUserLoader.load(parent.id);
    },
  },
};
```

### Apollo Client Setup (Frontend)
```typescript
// src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { auth } from '@clerk/nextjs/server';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
});

const authLink = setContext(async (_, { headers }) => {
  const { getToken } = auth();
  const token = await getToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: {
            // ✅ Pagination handling
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
});
```

### Type-Safe Queries (Frontend)
```typescript
// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      id
      name
      email
      createdAt
    }
  }
`;

// Auto-generated types from schema
import { useQuery } from '@apollo/client';
import type { GetUsersQuery, GetUsersQueryVariables } from '@/types/generated';

export function useUsers(variables?: GetUsersQueryVariables) {
  return useQuery<GetUsersQuery, GetUsersQueryVariables>(GET_USERS, {
    variables,
  });
}
```

---

## Node.js & Express Standards

### Server Setup
```typescript
// src/server.ts
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createContext } from './context';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

const app = express();

// ✅ Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// ✅ Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// ✅ Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    ApolloServerPluginLandingPageDisabled(),
    // ✅ Custom error handling
    {
      async requestDidStart() {
        return {
          async didEncounterErrors(ctx) {
            console.error('GraphQL Error:', ctx.errors);
          },
        };
      },
    },
  ],
});

await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: createContext,
  })
);

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
});
```

---

## PostgreSQL & Sequelize Standards

### Database Provider: Neon PostgreSQL (Primary)

**QuikNation uses Neon PostgreSQL for all projects:**
- **Serverless** - Auto-scales to zero when idle
- **Instant Branching** - Create dev/staging branches in < 1 second
- **$0 Free Tier** - 3 projects free
- **PostgreSQL** - Full SQL capabilities with Sequelize ORM

**Alternatives:** RDS (AWS-native), Supabase (all-in-one), Firebase (mobile-first)

[📖 Complete Database Options Guide](../database/DATABASE-OPTIONS.md)

### Connection Setup (Neon)
```typescript
// backend/src/database/config.ts
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Neon uses self-signed certs
    },
  },
  pool: {
    max: 5,  // Neon handles pooling internally
    min: 0,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Test connection
await sequelize.authenticate();
console.log('✅ Neon PostgreSQL connected');
```

### Model Definition
```typescript
// src/models/User.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export class User extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [{ fields: ['email'] }],
  }
);
```

### Migrations
```typescript
// migrations/20250101-create-users.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('users', ['email']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('users');
}
```

---

## Tailwind CSS Standards

### Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
} satisfies Config;
```

### Component Patterns
```typescript
// ✅ Use consistent spacing units
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Title</h1>
  <p className="mt-4 text-base md:text-lg text-gray-600">Description</p>
</div>

// ✅ Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// ✅ Use design tokens
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">
  Click me
</button>
```

---

## Redux Persist Standards

### Store Configuration
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import cartReducer from './slices/cartSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart'], // Only persist cart
};

const persistedReducer = persistReducer(persistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    cart: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
```

---

## Clerk Authentication Standards

### Setup
```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Protected Routes
```typescript
// src/middleware.ts
import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: ['/', '/api/webhook'],
  ignoredRoutes: ['/api/public'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## Stripe Payment Standards

### Checkout Session
```typescript
// src/app/api/create-checkout/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Product' },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
    metadata: { userId },
  });

  return NextResponse.json({ sessionId: session.id });
}
```

---

## React Native Standards

### Project Structure
```
mobile/
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── App.tsx
└── app.json
```

### Navigation
```typescript
// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

For complete implementation examples, see the boilerplate codebase.
