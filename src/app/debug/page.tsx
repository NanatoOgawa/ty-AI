"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface DebugInfo {
  timestamp?: string;
  environment?: {
    NODE_ENV?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    origin?: string;
    pathname?: string;
    userAgent?: string;
  };
  session?: {
    hasSession: boolean;
    sessionData?: unknown;
    sessionError?: string;
  };
  user?: {
    hasUser: boolean;
    userData?: unknown;
    userError?: string;
  };
  storage?: {
    localStorage?: Record<string, unknown>;
    cookies?: Record<string, string>;
    localStorageKeys?: string[];
  };
  error?: string;
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collectDebugInfo = async () => {
      try {
        // セッション情報を取得
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // ユーザー情報を取得
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // ローカルストレージの情報を取得
        const localStorageKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('sb-')
        );
        
        const localStorageData: Record<string, unknown> = {};
        localStorageKeys.forEach(key => {
          try {
            localStorageData[key] = JSON.parse(localStorage.getItem(key) || 'null');
          } catch {
            localStorageData[key] = localStorage.getItem(key);
          }
        });

        // クッキー情報を取得
        const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            acc[key] = value;
          }
          return acc;
        }, {});

        const info = {
          timestamp: new Date().toISOString(),
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
            origin: window.location.origin,
            pathname: window.location.pathname,
            userAgent: navigator.userAgent
          },
          session: {
            hasSession: !!session,
            sessionData: session,
            sessionError: sessionError?.message
          },
          user: {
            hasUser: !!user,
            userData: user,
            userError: userError?.message
          },
          storage: {
            localStorage: localStorageData,
            cookies: cookies,
            localStorageKeys: localStorageKeys
          }
        };

        setDebugInfo(info);
      } catch (error) {
        console.error("Debug info collection error:", error);
        setDebugInfo({ 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        });
      } finally {
        setLoading(false);
      }
    };

    collectDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">デバッグ情報を収集中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 認証デバッグ情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">📊 基本情報</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.environment, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">🔐 セッション情報</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.session, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">👤 ユーザー情報</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">💾 ストレージ情報</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.storage, null, 2)}
              </pre>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">🛠️ トラブルシューティング</h3>
              <ul className="text-sm space-y-1">
                <li>• セッションが存在しない場合：ログインし直してください</li>
                <li>• ローカルストレージが空の場合：認証フローに問題がある可能性があります</li>
                <li>• 環境変数が正しく設定されているか確認してください</li>
                <li>• Supabaseダッシュボードで認証設定を確認してください</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
