import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if user is authenticated
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if user is blocked
  const { data: userData } = await supabase
    .from("users")
    .select("is_blocked")
    .eq("id", session.user.id)
    .single();

  if (userData?.is_blocked) {
    return NextResponse.redirect(new URL("/blocked", req.url));
  }

  // Check if user is trying to access admin routes
  if (req.nextUrl.pathname.startsWith("/dashboard/admin")) {
    const { data: adminData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (!adminData?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*"],
};
