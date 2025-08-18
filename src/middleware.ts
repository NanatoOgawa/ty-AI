import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // パブリックルート（認証不要）
  const publicRoutes = ['/login', '/auth', '/api', '/test', '/debug'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // 重要な認証イベントのみログ出力
  if (!session && !isPublicRoute) {
    console.log("Auth required - redirecting to login:", request.nextUrl.pathname);
  }

  if (isPublicRoute) {
    return response;
  }

  // 認証が必要なルート
  if (!session) {
    // リダイレクトURLを動的に生成
    const loginUrl = new URL('/login', request.url);
    console.log("No session found, redirecting to login:", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [],
}; 