import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/save(.*)',              // Extension save page — renders publicly, handles its own auth
  '/api/articles/save',    // Must be public so Clerk doesn't 302-redirect; route handler returns 401 itself
  '/api/webhooks/clerk',
  '/api/articles/extension', // Extension CORS preflight must not be blocked by Clerk
  '/robots.txt',
  '/sitemap.xml'
])

export default clerkMiddleware(async (auth, request) => {
  // Let OPTIONS (CORS preflight) pass through without auth — the route handler
  // manages its own authentication for actual POST requests.
  if (request.method === 'OPTIONS') return

  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*[.](?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*'
  ],
}
