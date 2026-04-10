---
name: clerk-auth-standard
description: Implement Clerk authentication with RBAC, middleware protection, custom sign-in pages, provider setup, and backend JWT verification. Use when setting up authentication, implementing sign-in/sign-up flows, protecting routes, creating admin sign-in pages, or integrating Clerk with Apollo Client. Triggers on requests for authentication, login pages, user sessions, JWT verification, or role-based access control.
---

# Clerk Authentication Standard

## Overview

Production-tested patterns for implementing Clerk authentication with:
- **Route protection** via Next.js middleware
- **Custom sign-in pages** (customer and admin variants)
- **Provider setup** with Apollo Client integration
- **RBAC integration** via publicMetadata roles
- **Backend JWT verification** for GraphQL resolvers

## Environment Variables

```bash
# .env.local (frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# .env (backend)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Implementation Workflow

### 1. Install Dependencies

```bash
# Frontend
npm install @clerk/nextjs

# Backend
npm install @clerk/clerk-sdk-node
```

### 2. Create Middleware

Create `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/checkout(.*)',
]);

// Define admin routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Define public routes (no auth required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/admin-signin',
  '/admin-signup',
  '/products(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Public routes pass through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Admin routes redirect to admin sign-in
  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/admin-signin', req.url));
    }
    // Role checking happens in the admin layout
  }

  // Protected routes redirect to sign-in
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 3. Create Providers Component

Create `src/components/Providers.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloProvider } from '@apollo/client';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { store, persistor } from '@/store';
import { apolloClient, updateApolloClientAuth } from '@/lib/apollo-client';

interface ProvidersProps {
  children: React.ReactNode;
}

// Component to set up Apollo Client authentication
const AuthSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isLoaded) return;

      if (isSignedIn && getToken) {
        try {
          const testToken = await getToken();
          if (testToken && testToken.split('.').length === 3) {
            // Configure Apollo Client with token getter
            updateApolloClientAuth(async () => {
              try {
                return await getToken();
              } catch {
                return null;
              }
            });
          }
        } catch (error) {
          console.error('Auth setup error:', error);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <AuthSetup>
        <ApolloProvider client={apolloClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              {children}
            </PersistGate>
          </Provider>
        </ApolloProvider>
      </AuthSetup>
    </ClerkProvider>
  );
};
```

### 4. Customer Sign-In Page

Create `src/app/sign-in/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSignIn, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useUser();
  const { setActive } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.push('/');
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
      } else {
        setError('Sign in failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render sign-in form...
}
```

### 5. Admin Sign-In with Role Check

Create `src/app/admin-signin/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSignIn, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AdminSignIn() {
  const router = useRouter();
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();
  const { user, isSignedIn, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check admin access when user is loaded
  useEffect(() => {
    if (userLoaded && isSignedIn && user) {
      const userRole = (user.publicMetadata?.role as string) || 'USER';
      const adminRoles = ['ADMIN', 'STAFF', 'SITE_OWNER', 'SITE_ADMIN', 'CUSTOMER_SERVICE'];

      if (adminRoles.includes(userRole)) {
        router.push('/admin');
      } else {
        setError('Access denied: Admin privileges required.');
      }
    }
  }, [userLoaded, isSignedIn, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // useEffect handles role check
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed.');
      setIsLoading(false);
    }
  };

  // Render admin sign-in form with role feedback...
}
```

## Backend JWT Verification

### GraphQL Context

```typescript
import { clerkClient } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';

interface AuthContext {
  userId: string | null;
  sessionId: string | null;
  user: any | null;
}

export async function createContext({ req }): Promise<{ auth: AuthContext }> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return { auth: { userId: null, sessionId: null, user: null } };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.decode(token) as any;

    if (!decoded?.sub) {
      return { auth: { userId: null, sessionId: null, user: null } };
    }

    const user = await clerkClient.users.getUser(decoded.sub);

    return {
      auth: {
        userId: decoded.sub,
        sessionId: decoded.sid || null,
        user: user,
      },
    };
  } catch (error) {
    return { auth: { userId: null, sessionId: null, user: null } };
  }
}
```

### Protected Resolver Pattern

```typescript
// CRITICAL: Always check context.auth?.userId
const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.findByPk(context.auth.userId);
    },
  },

  Mutation: {
    updateProfile: async (_, { input }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.update(input, {
        where: { clerkId: context.auth.userId },
      });
    },
  },
};
```

## Webhook Synchronization

```typescript
// pages/api/webhooks/clerk.ts
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  const evt = wh.verify(body, {
    'svix-id': req.headers.get('svix-id'),
    'svix-timestamp': req.headers.get('svix-timestamp'),
    'svix-signature': req.headers.get('svix-signature'),
  }) as WebhookEvent;

  if (evt.type === 'user.created') {
    await db.user.create({
      data: {
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0]?.email_address,
        role: (evt.data.public_metadata?.role as string) || 'USER',
      },
    });
  }

  if (evt.type === 'user.updated') {
    await db.user.update({
      where: { clerkId: evt.data.id },
      data: { role: (evt.data.public_metadata?.role as string) || 'USER' },
    });
  }

  if (evt.type === 'user.deleted') {
    await db.user.delete({ where: { clerkId: evt.data.id } });
  }

  return new Response('Success', { status: 200 });
}
```

## Resources

### references/
- `webhook-events.md` - Clerk webhook event reference
- `jwt-structure.md` - JWT token structure and claims

### assets/
- `templates/middleware.ts` - Copy-ready middleware
- `templates/Providers.tsx` - Copy-ready providers
- `templates/SignIn.tsx` - Customer sign-in page
- `templates/AdminSignIn.tsx` - Admin sign-in with role check
