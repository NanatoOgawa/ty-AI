import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  try {
    console.log("Dashboard: Starting page load");
    
    const supabase = await createClient();
    console.log("Dashboard: Supabase client created");
    
    // セッション情報を取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("Dashboard: Session check:", { 
      hasSession: !!session, 
      error: sessionError?.message,
      sessionUser: session?.user?.email || "null"
    });
    
    // ユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Dashboard: Auth result:", { 
      user: user?.email || "null", 
      error: authError?.message,
      userId: user?.id || "null"
    });
    
    if (authError) {
      console.error("Dashboard: Auth error:", authError);
      redirect("/login");
    }
    
    if (!user) {
      console.log("Dashboard: No user found, redirecting to login");
      redirect("/login");
    }

    console.log("Dashboard: User authenticated, rendering page");

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              リピートつながるAI - ダッシュボード
            </h1>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
          
          <p className="text-gray-600 mb-8">
            ようこそ、{user.email}さん
          </p>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">認証成功</h2>
            <p className="text-green-600">
              ダッシュボードページが正常に表示されています。
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">デバッグ情報:</h3>
              <p>ユーザーID: {user.id}</p>
              <p>メールアドレス: {user.email}</p>
              <p>認証時刻: {new Date().toLocaleString("ja-JP")}</p>
              <p>セッション有効: {session ? "はい" : "いいえ"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard: Unexpected error:", error);
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            エラーが発生しました
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">エラー詳細</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">
              {error instanceof Error ? error.message : String(error)}
            </pre>
            <div className="mt-4">
              <a href="/login" className="text-blue-600 hover:underline">
                ログインページに戻る
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 