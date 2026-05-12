import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Responsibilities:
//  1. Capture ?ref=xxx on any route into an httpOnly cookie (30-day) and
//     strip the param from the URL with a 307 redirect.
//  2. Gate /admin behind HTTP Basic Auth (env-driven password).

const REF_COOKIE = "affiliate_ref";
const REF_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REF_RE = /^[a-z0-9-]{3,40}$/i;

export function proxy(req: NextRequest) {
  const { nextUrl } = req;

  // ----- 1. ref capture ----------------------------------------------------
  const ref = nextUrl.searchParams.get("ref");
  if (ref && REF_RE.test(ref)) {
    const cleanUrl = nextUrl.clone();
    cleanUrl.searchParams.delete("ref");
    const res = NextResponse.redirect(cleanUrl, 307);
    res.cookies.set({
      name: REF_COOKIE,
      value: ref,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: REF_MAX_AGE,
      path: "/",
    });
    return res;
  }

  // ----- 2. /admin Basic Auth ---------------------------------------------
  if (nextUrl.pathname.startsWith("/admin")) {
    const expectedUser = process.env.ADMIN_USER ?? "owner";
    const expectedPass = process.env.ADMIN_PASSWORD;

    if (!expectedPass) {
      return new NextResponse(
        "ADMIN_PASSWORD not configured on the server.",
        { status: 500 },
      );
    }

    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Basic ")) {
      try {
        const decoded = atob(auth.slice(6));
        const sep = decoded.indexOf(":");
        const user = decoded.slice(0, sep);
        const pass = decoded.slice(sep + 1);
        if (user === expectedUser && pass === expectedPass) {
          return NextResponse.next();
        }
      } catch {
        // fall through to 401
      }
    }

    return new NextResponse("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="salemycar admin"' },
    });
  }

  return NextResponse.next();
}

// Run on all paths except static assets / Next internals.
export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)).*)"],
};
