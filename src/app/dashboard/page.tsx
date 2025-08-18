"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { getStats } from "../../lib/database";
import type { User } from "@supabase/supabase-js";
import type { UserStats } from "../../types";
import MobileNavigation from "../../components/common/MobileNavigation";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({ messageCount: 0, customerCount: 0, monthlyCount: 0 });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Dashboard auth check:", { hasSession: !!session, user: session?.user?.email });
        
        if (!session) {
          console.log("No session found, redirecting to login");
          router.push('/login');
          return;
        }
        
        setUser(session.user);
        
        // 統計情報を取得
        try {
          const userStats = await getStats(session.user);
          setStats(userStats);
        } catch (error) {
          console.error("Error loading stats:", error);
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Dashboard auth state change:", event, session);
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        router.push('/login');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

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
    
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                リピートつながるAI
              </h1>
              <p className="text-sm text-gray-500">お客様との関係を深めるAI</p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full touch-manipulation"
              aria-label="ログアウト"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto py-4 px-4">
        {/* ウェルカムメッセージ */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ようこそ！
          </h2>
          <p className="text-sm text-gray-600">
            AIがお客様との関係を深めるメッセージを生成します
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.messageCount}</div>
            <div className="text-xs text-gray-600">作成済み</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{stats.customerCount}</div>
            <div className="text-xs text-gray-600">お客様数</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.monthlyCount}</div>
            <div className="text-xs text-gray-600">今月の利用</div>
          </div>
        </div>

        {/* 機能カード */}
        <div className="space-y-4">
          {/* お客様管理 */}
          <button 
            onClick={() => router.push('/dashboard/customers')}
            className="w-full bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  お客様管理
                </h3>
                <p className="text-sm text-gray-600">
                  情報登録・編集・メッセージ作成
                </p>
              </div>
              <div className="ml-auto">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* メッセージ履歴 */}
          <button 
            onClick={() => router.push('/dashboard/history')}
            className="w-full bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  メッセージ履歴
                </h3>
                <p className="text-sm text-gray-600">
                  過去のメッセージ確認・管理
                </p>
              </div>
              <div className="ml-auto">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

            {/* トーン分析・設定 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      トーン分析・設定
                    </h3>
                    <p className="text-sm text-gray-500">
                      メッセージのトーンを分析・調整
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => router.push('/dashboard/tone-analysis')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    トーン分析
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">作成済みメッセージ</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.messageCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">登録お客様数</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.customerCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">今月の使用回数</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.monthlyCount}</p>
                  </div>
                </div>
              </div>
            </div>
          {/* トーン分析 */}
          <button 
            onClick={() => router.push('/dashboard/tone-analysis')}
            className="w-full bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  トーン分析
                </h3>
                <p className="text-sm text-gray-600">
                  メッセージの傾向分析と設定
                </p>
              </div>
              <div className="ml-auto">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </main>
      
      {/* モバイルナビゲーション */}
      <MobileNavigation />
    </div>
  );
} 