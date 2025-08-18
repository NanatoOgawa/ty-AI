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
        
        const redirectUrl = new URL(next, origin);
        console.log("Redirecting to:", redirectUrl.toString());
        return NextResponse.redirect(redirectUrl.toString());
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