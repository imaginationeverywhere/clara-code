You are a senior full-stack engineer assigned to build a modern web application from scratch.

## Objective

Develop a robust and scalable authentication system for a Nike-style e-commerce application. The system should support both authenticated users and guests using Better Auth, enabling email-password login (no verification in MVP), session management, and smooth guest-to-user transitions during login/signup. This system must be modular, extensible, and production-ready.

## Structure

- **Stack**: PostgreSQL + Drizzle ORM + Next.js (App Router) + Better Auth
- **Auth**: Cookie-based session auth using Better Auth (`auth_session`) and guest session (`guest_session`)
- **ORM Setup**: Modular schema files using Drizzle ORM
- **Folder Structure**:
	```
	/lib
		/db
		└── /schema
		    ├── user.ts
		    ├── account.ts
		    ├── session.ts
		    ├── verification.ts
		    └── guest.ts
		    └── index.ts
	```

## Tasks

1. **Create Auth-Related Database Schemas** (PostgreSQL via Drizzle ORM)
 
 a. `user` table  
 - `id`: uuid (UUID, primary key)  
 - `name`: string (optional)  
 - `email`: string (unique, not null)  
 - `emailVerified`: boolean (default false, not null)  
 - `image`: string (optional)  
 - `createdAt`: Date (default now, not null)  
 - `updatedAt`: Date (default now, not null)  

 b. `session` table  
 - `id`: uuid (UUID, primary key)  
 - `userId`: uuid (foreign key to `user.id`, not null)  
 - `token`: string (unique, not null)  
 - `ipAddress`: string  
 - `userAgent`: string  
 - `expiresAt`: Date (not null)  
 - `createdAt`: Date (default now, not null)  
 - `updatedAt`: Date (default now, not null)  

 c. `account` table  
 - `id`: uuid (UUID, primary key)  
 - `userId`: string (foreign key to `user.id`, not null)  
 - `accountId`: string (used for both email-password and OAuth accounts, not null)  
 - `providerId`: string (e.g. "credentials", "google", not null)  
 - `accessToken`: string (optional)  
 - `refreshToken`: string (optional)  
 - `accessTokenExpiresAt`: Date (optional)  
 - `refreshTokenExpiresAt`: Date (optional)  
 - `scope`: string (optional)  
 - `idToken`: string (optional)  
 - `password`: string (used for credentials login, optional)  
 - `createdAt`: Date (default now, not null)  
 - `updatedAt`: Date (default now, not null)  

 d. `verification` table  
 - `id`: uuid (UUID, primary key)  
 - `identifier`: string (e.g. email, not null)  
 - `value`: string (token/code to verify, not null)  
 - `expiresAt`: Date (not null)  
 - `createdAt`: Date (default now, not null)  
 - `updatedAt`: Date (default now, not null)  

 e. `guest` table  
 - `id`: uuid (UUID, primary key)  
 - `sessionToken`: string (unique, not null)  
 - `createdAt`: Date (default now, not null)  
 - `expiresAt`: Date (for auto-expiry, not null)

2. **Use Secure, Cookie-Based Session Management**
 - Use `auth_session` cookie for authenticated users (Better Auth handles this)
 - Use `guest_session` cookie for guests with UUID sessionToken
 - Cookies should be `HttpOnly`, `Secure`, `SameSite=strict`, `path=/`, `7-day expiry`

3. **Enable Guest-to-User Migration**
 - On successful login/signup, migrate guest cart and related records to the user account
 - Remove `guest_session` cookie and associated DB record

4. **Use Next.js Server Actions**
- Implement all auth-related logic using Next.js Server Actions
- Create `signUp`, `signIn`, `signOut`, `guestSession`, `createGuestSession`, and `mergeGuestCartWithUserCart`
- Put all of these functions in `lib/auth/actions.ts` 

5. **Route Protection & Checkout Flow**
- All product pages, categories, and cart routes are publicly accessible.
- Users can fully browse and use cart features without signing in.
- When proceeding to checkout, if user is not authenticated:
  - Redirect them to sign in/sign up page.
  - After successful login or account creation, merge cart data, then redirect to checkout page.

6. **Security & Validation**
- Follow industry best practices for, Authentication flow, Secure session handling, Input sanitation and Error handling
- Use Zod for strict validation, On all server action inputs, user-provided form data, and API payloads where applicable
- Ensure type safety across the stack using TypeScript + Zod schemas


## Output Requirements

- Drizzle-compatible schema definitions for all tables listed above
- Type-safe fields with correct defaults and constraints
- Modular files per table
- Ready to use with Better Auth (must not rename required tables/fields)
- Reusable and consistent schema that can be extended in future (e.g., 2FA, roles)

## Notes

- This is the MVP setup: email-password login only, no verification yet
- OAuth and verification are planned post-MVP, so include schema support now
- Do not implement cart, products, or orders — only auth-related tables
- Use correct TypeScript types as expected by Drizzle ORM
- Follow Better Auth's required structure strictly for `user`, `session`, `account`, and `verification`