import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require an authenticated session
const PRIVATE_PATHS = [
  "/feed",
  "/cerca",
  "/add",
  "/settings",
  "/profile",
  "/requests",
  "/onboarding",
];

export async function proxy(request: NextRequest) {
  // Refresh session cookies and forward them to the response
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates the JWT against Supabase and refreshes it if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPrivate = PRIVATE_PATHS.some((p) => pathname.startsWith(p));

  if (isPrivate && !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/cerca/:path*",
    "/add/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/requests/:path*",
    "/onboarding/:path*",
  ],
};
