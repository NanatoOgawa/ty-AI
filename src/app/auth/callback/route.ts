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
      
      console.log("Attempting to exchange code for session...");
      
      // PKCEフロー用のexchangeCodeForSession
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // PKCEエラーの場合は特別な処理
        if (error.message.includes('code verifier')) {
          console.log("PKCE error detected, attempting alternative approach...");
          // implicitフローにフォールバック
          return NextResponse.redirect(`${origin}/login?pkce_error=true`);
        }
        
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }

      if (data.session) {
        console.log("Auth callback: Session established successfully", {
          user: data.session.user?.email,
          expiresAt: data.session.expires_at
        });
        
        // セッションが確実に保存されるまで少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // リダイレクトURLを動的に生成
        const redirectUrl = new URL(next, origin);
        console.log("Redirecting to:", redirectUrl.toString());
        
        // レスポンスヘッダーにキャッシュ無効化を追加
        const response = NextResponse.redirect(redirectUrl.toString());
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
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