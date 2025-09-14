import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [/^\/dashboard/, /^\/decks/, /^\/classrooms/];

export function middleware(req: NextRequest) {
  const token = req.cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY || "aremos_token")?.value;
  const url = req.nextUrl.pathname;
  
  // Check if the current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((pattern) => pattern.test(url));
  
  if (isProtectedRoute) {
    // If no valid token, redirect to login
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    
    // TODO: Add token validation here if needed
    // For now, we trust that the token exists
  }
  
  // Allow all other requests to continue
  return NextResponse.next();
}

export const config = { 
  matcher: ["/dashboard/:path*", "/decks/:path*", "/classrooms/:path*"] 
};