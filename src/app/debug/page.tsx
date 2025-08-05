"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

export default function DebugPage() {
  const [authInfo, setAuthInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // セッション情報を取得
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // ユーザー情報を取得
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // クッキー情報を取得
        const cookies = document.cookie;
        
        setAuthInfo({
          session: {
            exists: !!session,
            user: session?.user?.email || "null",
            expiresAt: session?.expires_at || "null",
            error: sessionError?.message || "null"
          },
          user: {
            exists: !!user,
            email: user?.email || "null",
            id: user?.id || "null",
            error: userError?.message || "null"
          },
          cookies: cookies,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        setAuthInfo({
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">認証デバッグ情報</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">認証状態</h2>
          
          {authInfo.error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">エラー: {authInfo.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-800 mb-2">セッション情報</h3>
                <p>存在: {authInfo.session.exists ? "はい" : "いいえ"}</p>
                <p>ユーザー: {authInfo.session.user}</p>
                <p>有効期限: {authInfo.session.expiresAt}</p>
                <p>エラー: {authInfo.session.error}</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="font-medium text-green-800 mb-2">ユーザー情報</h3>
                <p>存在: {authInfo.user.exists ? "はい" : "いいえ"}</p>
                <p>メール: {authInfo.user.email}</p>
                <p>ID: {authInfo.user.id}</p>
                <p>エラー: {authInfo.user.error}</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-medium text-yellow-800 mb-2">クッキー情報</h3>
                <pre className="text-xs text-yellow-700 whitespace-pre-wrap">
                  {authInfo.cookies}
                </pre>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium text-gray-800 mb-2">タイムスタンプ</h3>
                <p>{authInfo.timestamp}</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 space-x-4">
            <a 
              href="/dashboard" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ダッシュボードに移動
            </a>
            <a 
              href="/login" 
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ログインページに移動
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
