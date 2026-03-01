import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isProtected = [
    "/profile", "/onboarding", "/teams", "/search",
    "/recommend-venue", "/claim-venue", "/watch-events/new",
  ].some((p) => req.nextUrl.pathname.startsWith(p))
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/signin", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
