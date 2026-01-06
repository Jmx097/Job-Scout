import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Public routes that don't require authentication.
 * All /app/* routes are protected by default.
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  
  // Protect all routes under /app/*
  if (request.nextUrl.pathname.startsWith('/app')) {
    if (!userId) {
      return Response.redirect(new URL('/sign-in', request.url));
    }
    return;
  }

  // Protect other non-public routes
  if (!isPublicRoute(request) && !userId) {
    return Response.redirect(new URL('/sign-in', request.url));
  }
});

export const config = {
  matcher: [
    // Match all paths except static files and _next
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
