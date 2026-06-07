import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authCookie = request.cookies.get("pct_user")?.value;
  if (!authCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { state } = JSON.parse(decodeURIComponent(authCookie));
    if (!state?.token || !state?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role: string = state.user.role;
    const allowed: Record<string, string> = {
      admin: "/admin",
      secretaire: "/secretaire",
      enseignant: "/enseignant",
    };

    const ownRoot = allowed[role];
    const isOwn = ownRoot && pathname.startsWith(ownRoot);
    if (!isOwn) {
      return NextResponse.redirect(new URL(ownRoot ?? "/login", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path+",
    "/secretaire",
    "/secretaire/:path+",
    "/enseignant",
    "/enseignant/:path+",
  ],
};
