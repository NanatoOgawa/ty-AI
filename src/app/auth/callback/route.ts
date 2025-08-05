import { createClient } from "../../../lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Auth callback: Received request", { 
    code: !!code, 
    next, 
    origin,
    url: request.url,
    hasFragment: request.url.includes('#')
  });

  if (code) {
    try {
      console.log("Auth callback: Exchanging code for session");
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      console.log("Auth callback: Exchange result", { 
        success: !error, 
        error: error?.message,
        session: !!data.session,
        user: data.user?.email || "null"
      });

      if (error) {
        console.error("Auth callback: Exchange error:", error);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }

      // セッションが正常に設定されたことを確認
      if (data.session) {
        console.log("Auth callback: Session established successfully, redirecting to", `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.error("Auth callback: No session established");
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("セッションの確立に失敗しました")}`);
      }
    } catch (error) {
      console.error("Auth callback: Unexpected error:", error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("認証エラーが発生しました")}`);
    }
  }

  console.log("Auth callback: No code provided, redirecting to login");
  return NextResponse.redirect(`${origin}/login`);
} 