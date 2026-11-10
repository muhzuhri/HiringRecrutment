import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Helper to ensure cookies persist through redirects
  const makeRedirect = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  // Refresh user session if present
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Route protection: Protect /dashboard for unauthenticated users
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return makeRedirect(url);
  }

  // 2. Route protection: Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return makeRedirect(url);
    }

    // Query profile to check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || user.user_metadata?.role || "candidate";

    // Only 'admin', 'recruiter', and 'interviewer' (Penilai) are allowed in /admin routes
    if (userRole !== "admin" && userRole !== "recruiter" && userRole !== "interviewer") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("error", "unauthorized_admin_access");
      return makeRedirect(url);
    }

    // If role is interviewer (Penilai), redirect to /admin/evaluations if they visit /admin dashboard or jobs
    if (userRole === "interviewer" && (pathname === "/admin" || pathname === "/admin/jobs")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/evaluations";
      return makeRedirect(url);
    }
  }

  // 3. Redirect logged-in users away from auth pages
  if (user) {
    if (pathname === "/login" || pathname === "/register") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || user.user_metadata?.role || "candidate";
      let targetPath = "/dashboard";
      if (userRole === "admin" || userRole === "recruiter") {
        targetPath = "/admin";
      } else if (userRole === "interviewer") {
        targetPath = "/admin/evaluations";
      }

      const url = request.nextUrl.clone();
      url.pathname = targetPath;
      return makeRedirect(url);
    }

    if (pathname === "/admin/login") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || user.user_metadata?.role || "candidate";
      const targetPath =
        userRole === "interviewer"
          ? "/admin/evaluations"
          : userRole === "admin" || userRole === "recruiter"
          ? "/admin"
          : "/dashboard";

      const url = request.nextUrl.clone();
      url.pathname = targetPath;
      return makeRedirect(url);
    }
  }

  return supabaseResponse;
}
