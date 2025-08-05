import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("Middleware: Processing request", {
    pathname: request.nextUrl.pathname,
    url: request.url
  });

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Middleware: Auth check", {
    pathname: request.nextUrl.pathname,
    hasUser: !!user,
    userEmail: user?.email || "null"
  });

  // ログインページとAPIルートは認証不要
  if (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/api") ||
      request.nextUrl.pathname.startsWith("/auth-status") ||
      request.nextUrl.pathname.startsWith("/auth/callback") ||
      request.nextUrl.pathname.startsWith("/test-auth")) {
    console.log("Middleware: Allowing access to public route");
    return supabaseResponse;
  }

  // 未認証ユーザーはログインページにリダイレクト
  if (!user) {
    console.log("Middleware: No user found, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("Middleware: User authenticated, allowing access");
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 