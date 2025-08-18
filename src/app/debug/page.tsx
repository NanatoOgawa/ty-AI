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
    projectRef?: string;
  };
  requiredUrls?: {
    currentSiteUrl?: string;
    supabaseCallbackUrl?: string;
    appCallbackUrl?: string;
    appDashboardUrl?: string;
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

        // URL情報を解析
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0];
        
        const info = {
          timestamp: new Date().toISOString(),
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
            origin: window.location.origin,
            pathname: window.location.pathname,
            userAgent: navigator.userAgent,
            projectRef: projectRef
          },
          requiredUrls: {
            currentSiteUrl: window.location.origin,
            supabaseCallbackUrl: `${supabaseUrl?.replace('.supabase.co', '')}.supabase.co/auth/v1/callback`,
            appCallbackUrl: `${window.location.origin}/auth/callback`,
            appDashboardUrl: `${window.location.origin}/dashboard`
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
            
            <div>
              <h3 className="font-semibold mb-2">🔗 必要な設定URL</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.requiredUrls, null, 2)}
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
            
            <div className="mt-4 p-4 bg-yellow-50 rounded">
              <h3 className="font-semibold mb-2">⚙️ Google Cloud Console設定確認</h3>
              <div className="text-sm space-y-2">
                <p className="font-medium">承認済みJavaScriptの生成元:</p>
                <code className="block bg-white p-2 rounded text-xs">
                  {debugInfo.requiredUrls?.currentSiteUrl}<br/>
                  http://localhost:3000
                </code>
                
                <p className="font-medium mt-3">承認済みリダイレクトURI:</p>
                <code className="block bg-white p-2 rounded text-xs">
                  {debugInfo.requiredUrls?.appCallbackUrl}<br/>
                  {debugInfo.requiredUrls?.supabaseCallbackUrl}<br/>
                  http://localhost:3000/auth/callback
                </code>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 rounded">
              <h3 className="font-semibold mb-2">🔐 Supabase設定確認</h3>
              <div className="text-sm space-y-2">
                <p className="font-medium">Site URL:</p>
                <code className="block bg-white p-2 rounded text-xs">
                  {debugInfo.requiredUrls?.currentSiteUrl}
                </code>
                
                <p className="font-medium mt-3">Redirect URLs:</p>
                <code className="block bg-white p-2 rounded text-xs">
                  {debugInfo.requiredUrls?.appCallbackUrl}<br/>
                  {debugInfo.requiredUrls?.appDashboardUrl}<br/>
                  http://localhost:3000/auth/callback<br/>
                  http://localhost:3000/dashboard
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
