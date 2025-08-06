"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavigationTester from "../../components/common/NavigationTester";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function TestPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 認証状態をチェック
    const checkAuth = async () => {
      try {
        const { createClient } = await import('../../lib/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>🔒 認証が必要</CardTitle>
            <CardDescription>
              遷移テストを実行するにはログインが必要です
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              ログインページへ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 遷移テストページ
          </h1>
          <p className="text-gray-600">
            アプリケーション内の各ページへの遷移をテストできます
          </p>
        </div>

        <div className="space-y-8">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">現在のページ</h4>
                  <p className="text-sm text-gray-600">{window.location.pathname}</p>
                </div>
                <div>
                  <h4 className="font-semibold">認証状態</h4>
                  <p className="text-sm text-green-600">✅ 認証済み</p>
                </div>
                <div>
                  <h4 className="font-semibold">ブラウザ</h4>
                  <p className="text-sm text-gray-600">{navigator.userAgent}</p>
                </div>
                <div>
                  <h4 className="font-semibold">画面サイズ</h4>
                  <p className="text-sm text-gray-600">{window.innerWidth} x {window.innerHeight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 遷移テストツール */}
          <NavigationTester />

          {/* 手動テスト */}
          <Card>
            <CardHeader>
              <CardTitle>🔗 手動遷移テスト</CardTitle>
              <CardDescription>
                各ページへの手動遷移をテストできます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  { path: '/', name: 'ホーム' },
                  { path: '/dashboard', name: 'ダッシュボード' },
                  { path: '/dashboard/customers', name: 'お客様管理' },
                  { path: '/dashboard/history', name: 'メッセージ履歴' },
                  { path: '/dashboard/tone-analysis', name: 'トーン分析' },
                  { path: '/dashboard/notes', name: 'メモ管理' },
                  { path: '/dashboard/create', name: 'メッセージ作成' },
                  { path: '/dashboard/create/from-notes', name: 'メモから作成' }
                ].map((page) => (
                  <Button
                    key={page.path}
                    onClick={() => router.push(page.path)}
                    variant="outline"
                    className="h-auto py-2 px-3 text-sm"
                  >
                    {page.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 