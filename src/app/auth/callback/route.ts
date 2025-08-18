import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("🔵 Auth callback called with:", { 
    code: !!code, 
    codeLength: code?.length,
    next, 
    origin,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer')
  });

  // Implicit flowの場合、セッションはクライアント側で処理される
  // サーバーサイドではリダイレクトのみ行う
  console.log("🟡 Implicit flow - redirecting to dashboard");
  
  const redirectUrl = new URL(next, origin);
  console.log("🟢 Redirecting to:", redirectUrl.toString());
  
  const response = NextResponse.redirect(redirectUrl.toString());
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
} 