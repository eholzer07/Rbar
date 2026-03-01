import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const pathname = req.nextUrl.pathname

  // Admin routes: require auth + ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!req.auth) return NextResponse.redirect(new URL("/signin", req.url))
    if (req.auth.user?.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url))
    return
  }

  // Protected routes: require auth
  const isProtected = [
    "/profile", "/onboarding", "/teams", "/search",
    "/recommend-venue", "/claim-venue", "/watch-events/new", "/review", "/feed", "/notifications",
  ].some((p) => pathname.startsWith(p))
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/signin", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
