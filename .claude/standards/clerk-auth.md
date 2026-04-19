# Clerk Auth Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --clerk`

Covers: Clerk middleware, custom sign-in/sign-up pages, Provider setup, webhook sync, RBAC, backend JWT verification, and the profile widget.

---

## CRITICAL RULES

### 1. Credentials from SSM — never hardcoded

```bash
# SSM paths
/[project]/dev/CLERK_PUBLISHABLE_KEY
/[project]/dev/CLERK_SECRET_KEY
/[project]/dev/CLERK_WEBHOOK_SECRET
/[project]/prod/CLERK_PUBLISHABLE_KEY
/[project]/prod/CLERK_SECRET_KEY
/[project]/prod/CLERK_WEBHOOK_SECRET

# Frontend env (build-time — from SSM before npm run build)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

### 2. Custom sign-in/sign-up pages — always use hooks, never embed `<SignIn />`

```typescript
// ✅ Hook-based custom sign-in (matches Heru design system)
"use client";
import { useSignIn, useClerk } from "@clerk/nextjs";

export default function SignInPage() {
  const { signIn, isLoaded } = useSignIn();
  const { setActive } = useClerk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn!.create({ identifier: email, password });
    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
      router.push("/dashboard");
    }
  };

  // Render your own form using Heru design system
}

// ❌ Never embed Clerk's pre-built components — they don't match the design system
<SignIn appearance={{ ... }} />
```

---

### 3. Middleware — protect routes at the edge

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/account(.*)", "/checkout(.*)"]);
const isAdminRoute     = createRouteMatcher(["/admin(.*)"]);
const isPublicRoute    = createRouteMatcher([
  "/", "/sign-in", "/sign-up", "/api/webhooks(.*)", "/api/health",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isPublicRoute(req)) return NextResponse.next();

  if (isAdminRoute(req)) {
    if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));
    // Role check happens in /admin layout — NOT in middleware
  }

  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

---

### 4. Providers setup — required order

```typescript
// src/components/Providers.tsx
"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ApolloProvider } from "@apollo/client";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { apolloClient, updateApolloClientAuth } from "@/lib/apollo-client";
import { store, persistor } from "@/store";

// Provider order: ClerkProvider → AuthSetup → ApolloProvider → Redux → PersistGate
// AuthSetup wires Clerk token → Apollo Client headers

const AuthSetup = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      updateApolloClientAuth(async () => {
        try { return await getToken(); }
        catch { return null; }
      });
    }
    setReady(true);
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || !ready) return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
      <AuthSetup>
        <ApolloProvider client={apolloClient}>
          <ReduxProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              {children}
            </PersistGate>
          </ReduxProvider>
        </ApolloProvider>
      </AuthSetup>
    </ClerkProvider>
  );
}
```

---

### 5. Profile Widget — required on every authenticated layout

```typescript
// ✅ Profile widget in navbar/header — shows user avatar, name, and subscription tier
// src/components/ProfileWidget.tsx
"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { UserCircle, ChevronDown, LogOut, Settings, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileWidget() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded || !user) return null;

  const tier = (user.publicMetadata?.subscription_tier as string) ?? "free";
  const walletBalance = (user.publicMetadata?.wallet_balance as number) ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 hover:bg-white/10 transition-colors">
          {user.imageUrl
            ? <img src={user.imageUrl} alt={user.fullName ?? ""} className="w-8 h-8 rounded-full object-cover" />
            : <UserCircle className="w-8 h-8 text-brand-teal" />
          }
          <span className="text-sm font-medium hidden md:block">{user.firstName}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-brand-bg border border-white/10">
        {/* User info header */}
        <div className="px-3 py-2 border-b border-white/10">
          <p className="text-sm font-semibold">{user.fullName}</p>
          <p className="text-xs text-gray-400">{user.primaryEmailAddress?.emailAddress}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple capitalize">{tier}</span>
            <span className="text-xs text-brand-teal font-mono">${walletBalance.toFixed(2)}</span>
          </div>
        </div>
        <DropdownMenuItem onClick={() => router.push("/account/profile")}>
          <Settings className="w-4 h-4 mr-2" /> Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/account/wallet")}>
          <Wallet className="w-4 h-4 mr-2" /> Wallet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut(() => router.push("/"))} className="text-red-400">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### 6. RBAC — roles via Clerk `publicMetadata`

```typescript
// ✅ Role stored in publicMetadata.role — set server-side only
// Valid roles: "USER" | "ADMIN" | "STAFF" | "SITE_OWNER" | "SITE_ADMIN"

// Read role on frontend
const { user } = useUser();
const role = (user?.publicMetadata?.role as string) ?? "USER";
const isAdmin = ["ADMIN", "SITE_OWNER", "SITE_ADMIN"].includes(role);

// Admin layout protection
// app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = sessionClaims?.metadata?.role as string;
  if (!["ADMIN", "SITE_OWNER"].includes(role ?? "")) redirect("/dashboard");
  return <>{children}</>;
}

// Set role via Clerk backend API (webhook or admin action only)
await clerkClient.users.updateUser(userId, {
  publicMetadata: { role: "ADMIN" },
});

// ❌ Never expose a route that lets users set their own role
```

---

### 7. Webhook sync — Svix signature verification required

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Not configured", { status: 503 });

  const body = await req.text();
  const wh = new Webhook(secret);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id":        req.headers.get("svix-id")!,
      "svix-timestamp": req.headers.get("svix-timestamp")!,
      "svix-signature": req.headers.get("svix-signature")!,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    await User.create({
      clerkId: evt.data.id,
      email: evt.data.email_addresses[0]?.email_address,
      name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim(),
      role: (evt.data.public_metadata?.role as string) ?? "USER",
    });
  }

  if (evt.type === "user.updated") {
    await User.update(
      { role: (evt.data.public_metadata?.role as string) ?? "USER" },
      { where: { clerkId: evt.data.id } }
    );
  }

  if (evt.type === "user.deleted") {
    await User.update({ status: "deleted" }, { where: { clerkId: evt.data.id } });
    // Soft delete — never hard delete user records
  }

  return new Response("OK", { status: 200 });
}
```

---

### 8. Backend JWT verification

```typescript
// backend/src/middleware/auth.ts
import { createClerkClient } from "@clerk/clerk-sdk-node";
import jwt from "jsonwebtoken";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "unauthorized" }); return; }

  try {
    const decoded = jwt.decode(token) as { sub: string; sid: string };
    if (!decoded?.sub) throw new Error("invalid token");

    const user = await clerk.users.getUser(decoded.sub);
    req.claraUser = {
      userId: decoded.sub,
      sessionId: decoded.sid,
      role: (user.publicMetadata?.role as string) ?? "USER",
      email: user.emailAddresses[0]?.emailAddress,
    };
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}
```

---

### Heru-specific tech doc required

Each Heru using Clerk MUST have `docs/standards/clerk.md` documenting:
- Clerk Application ID and environment (dev/prod keys in SSM)
- Webhook endpoint URLs registered in Clerk Dashboard
- RBAC roles defined and what each role can access
- OAuth providers enabled (GitHub, Google, etc.)
- Redirect URLs after sign-in/sign-up

If `docs/standards/clerk.md` does not exist, create it.
