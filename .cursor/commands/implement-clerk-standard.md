# Implement Clerk Standard

**COMMAND AUTHORITY**: This command implements production-ready Clerk authentication using the `clerk-auth-standard` skill with middleware, providers, sign-in pages, and webhook synchronization.

## Command Purpose

Implement complete Clerk authentication with:
- **Middleware protection** - Route-level authentication guards
- **Provider setup** - ClerkProvider with Apollo integration
- **Sign-in pages** - Customer and admin authentication flows
- **Webhook sync** - User synchronization with database
- **RBAC integration** - Role-based access control

## Prerequisites

Before running this command, ensure:
1. ✅ Clerk account created at clerk.com
2. ✅ Application created in Clerk dashboard
3. ✅ Environment variables ready:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. ✅ `frontend/` workspace exists with Next.js 16

## Usage

```bash
# Interactive mode - guided setup
/implement-clerk-standard

# Full authentication setup
/implement-clerk-standard --complete

# Specific component
/implement-clerk-standard --component="middleware"
/implement-clerk-standard --component="admin-signin"
/implement-clerk-standard --component="webhooks"

# With specific options
/implement-clerk-standard --admin-route="/admin-signin" --customer-route="/sign-in"
```

## Command Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--complete` | Implement full authentication system | `false` |
| `--component` | Implement specific component only | - |
| `--admin-route` | Admin sign-in route | `/admin-signin` |
| `--customer-route` | Customer sign-in route | `/sign-in` |
| `--webhooks` | Include webhook setup | `true` |
| `--rbac` | Include RBAC hook | `true` |

## Execution Steps

### Step 1: Install Clerk Dependencies

```bash
cd frontend
npm install @clerk/nextjs @clerk/themes
```

### Step 2: Configure Environment Variables

Create/update `.env.local`:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Sign-in/Sign-up URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Step 3: Implement Middleware

Create `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/admin-signin(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/account(.*)',
  '/orders(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin routes
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as any)?.role || 'CUSTOMER';
    const adminRoles = ['STAFF', 'ADMIN', 'SITE_ADMIN', 'SITE_OWNER'];

    if (!adminRoles.includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Step 4: Setup Providers

Create `src/components/Providers.tsx`:

```typescript
'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { apolloClient } from '@/lib/apollo-client';
import { store, persistor } from '@/lib/store';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#3b82f6',
          colorTextOnPrimaryBackground: '#ffffff',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          card: 'shadow-lg',
        },
      }}
    >
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ApolloProvider client={apolloClient}>
            {children}
          </ApolloProvider>
        </PersistGate>
      </ReduxProvider>
    </ClerkProvider>
  );
}
```

Update `src/app/layout.tsx`:

```typescript
import { Providers } from '@/components/Providers';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 5: Create Customer Sign-In Page

Create `src/app/sign-in/[[...sign-in]]/page.tsx`:

```typescript
'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Clerk Sign In */}
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-none p-0',
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />

        {/* Admin Sign In Link */}
        <div className="text-center text-sm text-gray-600">
          <span>Are you staff? </span>
          <Link href="/admin-signin" className="text-primary hover:underline">
            Sign in to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Step 6: Create Admin Sign-In Page

Create `src/app/admin-signin/[[...admin-signin]]/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert } from 'lucide-react';

const ADMIN_ROLES = ['STAFF', 'ADMIN', 'SITE_ADMIN', 'SITE_OWNER'];

export default function AdminSignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { user } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already signed in, check role and redirect
  if (user) {
    const role = (user.publicMetadata?.role as string) || 'CUSTOMER';
    if (ADMIN_ROLES.includes(role)) {
      router.push('/admin');
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        // Check if user has admin role
        const userRole = (result.createdSessionId as any)?.user?.publicMetadata?.role;

        if (!userRole || !ADMIN_ROLES.includes(userRole)) {
          setError('This account does not have admin access. Please use the customer sign-in page.');
          await signIn.signOut();
          return;
        }

        await setActive({ session: result.createdSessionId });
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Admin Sign In</CardTitle>
          <CardDescription>
            Access restricted to authorized staff only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In to Admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 7: Create Sign-Up Page

Create `src/app/sign-up/[[...sign-up]]/page.tsx`:

```typescript
'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600">Get started with your account</p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-none p-0',
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}
```

### Step 8: Setup Webhook Endpoint

Create `src/app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;

  switch (eventType) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      // Sync user to database via GraphQL
      await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          query: `
            mutation SyncClerkUser($input: SyncClerkUserInput!) {
              syncClerkUser(input: $input) {
                id
                clerkId
              }
            }
          `,
          variables: {
            input: {
              clerkId: id,
              email: email_addresses[0]?.email_address,
              firstName: first_name,
              lastName: last_name,
              imageUrl: image_url,
            },
          },
        }),
      });
      break;
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

      // Update user in database
      await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateClerkUser($input: UpdateClerkUserInput!) {
              updateClerkUser(input: $input) {
                id
                role
              }
            }
          `,
          variables: {
            input: {
              clerkId: id,
              email: email_addresses[0]?.email_address,
              firstName: first_name,
              lastName: last_name,
              imageUrl: image_url,
              role: public_metadata?.role,
            },
          },
        }),
      });
      break;
    }

    case 'user.deleted': {
      const { id } = evt.data;

      // Mark user as deleted in database
      await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteClerkUser($clerkId: String!) {
              deleteClerkUser(clerkId: $clerkId) {
                success
              }
            }
          `,
          variables: { clerkId: id },
        }),
      });
      break;
    }

    case 'session.created':
    case 'session.ended':
      // Log session events for analytics
      console.log(`Session ${eventType}:`, evt.data.id);
      break;

    default:
      console.log(`Unhandled webhook event: ${eventType}`);
  }

  return new Response('OK', { status: 200 });
}
```

### Step 9: Create RBAC Hook

Create `src/hooks/useClerkRBAC.ts` (same as in admin panel command):

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

const roleHierarchy = [
  'CUSTOMER',
  'USER',
  'CUSTOMER_SERVICE',
  'STAFF',
  'ADMIN',
  'SITE_ADMIN',
  'SITE_OWNER',
] as const;

type SystemRole = (typeof roleHierarchy)[number];
type AccessLevel = 'FULL' | 'ADMIN' | 'STAFF' | 'LIMITED' | 'NONE';

export function useClerkRBAC() {
  const { user, isLoaded } = useUser();

  const role = useMemo(() => {
    if (!isLoaded || !user) return 'CUSTOMER';
    return (user.publicMetadata?.role as SystemRole) || 'CUSTOMER';
  }, [user, isLoaded]);

  const roleIndex = roleHierarchy.indexOf(role);

  const hasMinRole = (minRole: SystemRole): boolean => {
    const minIndex = roleHierarchy.indexOf(minRole);
    return roleIndex >= minIndex;
  };

  const getAccessLevel = (): AccessLevel => {
    if (hasMinRole('SITE_OWNER')) return 'FULL';
    if (hasMinRole('ADMIN')) return 'ADMIN';
    if (hasMinRole('STAFF')) return 'STAFF';
    if (hasMinRole('USER')) return 'LIMITED';
    return 'NONE';
  };

  return {
    role,
    hasMinRole,
    getAccessLevel,
    canAccessAdmin: hasMinRole('STAFF'),
    canManageUsers: hasMinRole('ADMIN'),
    canManageSettings: hasMinRole('SITE_ADMIN'),
    isLoaded,
  };
}
```

### Step 10: Configure Clerk Dashboard

After implementation, configure in Clerk Dashboard:

1. **Webhooks**: Add endpoint `https://yourdomain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`

2. **Session Token**: Add custom claims for role
   ```json
   {
     "metadata": "{{user.public_metadata}}"
   }
   ```

3. **Public Metadata**: Set user roles via API or dashboard

## Output Structure

After running this command:

```
frontend/src/
├── app/
│   ├── layout.tsx              # Updated with Providers
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx        # Customer sign-in
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx        # Sign-up page
│   ├── admin-signin/
│   │   └── [[...admin-signin]]/
│   │       └── page.tsx        # Admin sign-in
│   └── api/
│       └── webhooks/
│           └── clerk/
│               └── route.ts    # Webhook endpoint
├── components/
│   └── Providers.tsx           # ClerkProvider + Apollo
├── hooks/
│   └── useClerkRBAC.ts         # RBAC hook
└── middleware.ts               # Route protection
```

## Success Criteria

- ✅ Customer sign-in works at `/sign-in`
- ✅ Admin sign-in works at `/admin-signin`
- ✅ Protected routes redirect to sign-in
- ✅ Admin routes verify admin roles
- ✅ Webhooks sync users to database
- ✅ RBAC hook correctly determines access levels

## Related Commands

- `/implement-admin-panel` - Setup admin panel after authentication
- `/backend-dev` - Setup backend GraphQL mutations for webhook sync

## Skill Reference

This command uses the `clerk-auth-standard` skill located at:
`.claude/skills/clerk-auth-standard/SKILL.md`

Templates available at:
`.claude/skills/clerk-auth-standard/assets/templates/`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
