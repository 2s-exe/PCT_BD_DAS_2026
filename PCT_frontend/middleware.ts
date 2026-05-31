import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  admin:      ["/admin"],
  secretaire: ["/secretaire"],
  enseignant: ["/enseignant"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques — laisser passer
  if (pathname === "/" || pathname === "/login") return NextResponse.next();

  // Lire le store persisté dans le cookie/localStorage via le header
  const authCookie = request.cookies.get("pct_user")?.value;
  if (!authCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { state } = JSON.parse(decodeURIComponent(authCookie));
    const { token, user } = state || {};

    if (!token || !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Vérifier que l'utilisateur a accès à la route demandée
    const allowedPaths = ROLE_ROUTES[user.role] || [];
    const hasAccess = allowedPaths.some((p) => pathname.startsWith(p));

    if (!hasAccess) {
      // Rediriger vers son propre dashboard
      const home = `/${user.role}`;
      return NextResponse.redirect(new URL(home, request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/secretaire/:path*", "/enseignant/:path*"],
};
