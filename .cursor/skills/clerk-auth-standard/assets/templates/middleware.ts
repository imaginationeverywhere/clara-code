import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// TODO: Customize protected routes for your application
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/checkout(.*)',
  '/orders(.*)',
]);

// TODO: Customize admin routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// TODO: Customize public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/admin-signin',
  '/admin-signup',
  '/products(.*)',
  '/categories(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow public routes without any checks
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Admin routes redirect to admin sign-in
  if (isAdminRoute(req) && !req.nextUrl.pathname.startsWith('/admin-signin')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/admin-signin', req.url));
    }
    // Role checking happens in the admin layout (client-side)
  }

  // Protected routes redirect to sign-in
  if (isProtectedRoute(req) && !userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
