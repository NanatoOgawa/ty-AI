import { createClient } from "../../../lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Auth callback called with:", { code: !!code, next, origin });

  if (code) {
    try {
      const supabase = await createClient();
      
      // PKCEフロー用のexchangeCodeForSession
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }

      if (data.session) {
        console.log("Auth callback: Session established successfully", {
          user: data.session.user?.email,
          expiresAt: data.session.expires_at
        });
        
        // リダイレクトURLを動的に生成（改善版）
        let redirectUrl: string;
        if (next.startsWith('http')) {
          redirectUrl = next;
        } else {
          redirectUrl = new URL(next, origin).toString();
        }
        
        console.log("Redirecting to:", redirectUrl);
        
        // レスポンスを作成し、セッションクッキーを確実に設定
        const response = NextResponse.redirect(redirectUrl);
        
        // セッションクッキーを明示的に設定
        if (data.session.access_token) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          });
        }
        
        if (data.session.refresh_token) {
          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
          });
        }
        
        return response;
      } else {
        console.error("Auth callback: No session established");
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