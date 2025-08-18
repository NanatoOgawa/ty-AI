import { createClient } from "../../../lib/supabase/server";
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

  if (code) {
    try {
      const supabase = await createClient();
      
      console.log("🟡 Attempting to exchange code for session...");
      console.log("🟡 Code details:", {
        codeStart: code.substring(0, 10),
        codeEnd: code.substring(code.length - 10)
      });
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log("🟡 Exchange result:", {
        hasData: !!data,
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        hasError: !!error
      });

      if (error) {
        console.error("Auth callback error:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name
        });
        console.error("Request details:", {
          origin,
          code: code?.substring(0, 10) + "...",
          userAgent: request.headers.get('user-agent')
        });
        
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}&error_code=${encodeURIComponent(error.code || 'unknown')}`);
      }

      if (data.session) {
        console.log("🟢 Auth callback: Session established successfully", {
          user: data.session.user?.email,
          expiresAt: data.session.expires_at,
          sessionId: data.session.access_token?.substring(0, 20) + "..."
        });
        
        const redirectUrl = new URL(next, origin);
        console.log("🟢 Redirecting to:", redirectUrl.toString());
        
        const response = NextResponse.redirect(redirectUrl.toString());
        // セッション保存を確実にするためのヘッダー
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
      } else {
        console.error("🔴 Auth callback: No session established");
        console.error("🔴 Data received:", data);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("セッションの確立に失敗しました")}`);
      }
    } catch (error) {
      console.error("Auth callback unexpected error:", error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("認証エラーが発生しました")}`);
    }
  }

  console.log("Auth callback: No code provided");
  return NextResponse.redirect(`${origin}/login`);
} 