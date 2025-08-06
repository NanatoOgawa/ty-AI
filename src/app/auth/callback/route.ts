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
        
        // Supabaseの標準的なセッションクッキー名を生成
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0];
        const sessionCookieName = `sb-${projectRef}-auth-token`;
        
        if (data.session.access_token) {
          // セッション情報をJSON形式で保存
          const sessionData = {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
            expires_at: data.session.expires_at,
            token_type: data.session.token_type,
            user: data.session.user
          };
          
          response.cookies.set(sessionCookieName, JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
          });
          
          console.log("Session cookie set:", sessionCookieName);
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