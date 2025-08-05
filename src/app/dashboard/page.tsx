"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard: Component mounted");

    const checkAuth = async () => {
      try {
        // セッション情報を取得
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        console.log("Dashboard: Session check:", { 
          hasSession: !!currentSession, 
          error: sessionError?.message,
          sessionUser: currentSession?.user?.email || "null"
        });

        if (sessionError) {
          console.error("Dashboard: Session error:", sessionError);
          setError(sessionError.message);
          setIsLoading(false);
          return;
        }

        // ユーザー情報を取得
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        console.log("Dashboard: Auth result:", { 
          user: currentUser?.email || "null", 
          error: authError?.message,
          userId: currentUser?.id || "null"
        });

        if (authError) {
          console.error("Dashboard: Auth error:", authError);
          setError(authError.message);
          setIsLoading(false);
          return;
        }

        if (!currentUser) {
          console.log("Dashboard: No user found, redirecting to login");
          router.push('/login');
          return;
        }

        console.log("Dashboard: User authenticated, setting state");
        setUser(currentUser);
        setSession(currentSession);
        setIsLoading(false);

      } catch (error) {
        console.error("Dashboard: Unexpected error:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    checkAuth();

    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Dashboard: Auth state change:", { event, session: !!session });
      
      if (event === 'SIGNED_OUT') {
        console.log("Dashboard: User signed out, redirecting to login");
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  // エラーが発生した場合
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            エラーが発生しました
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">エラー詳細</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">
              {error}
            </pre>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:underline"
              >
                ログインページに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ユーザーが認証されていない場合
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">認証されていません</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 text-blue-600 hover:underline"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    );
  }

  // 正常なダッシュボード表示
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            リピートつながるAI - ダッシュボード
          </h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            ログアウト
          </button>
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
} 