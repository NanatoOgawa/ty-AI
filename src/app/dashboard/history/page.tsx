"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../lib/supabase/client";
import { getMessageHistory, getStats } from "../../../lib/database";
import type { User } from "@supabase/supabase-js";
import type { MessageHistory, UserStats } from "../../../types";
import { MESSAGE_TYPE_LABELS, TONE_LABELS } from "../../../types";

export default function MessageHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<MessageHistory[]>([]);
  const [stats, setStats] = useState<UserStats>({ messageCount: 0, customerCount: 0, monthlyCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");

  useEffect(() => {
    const checkAuth = async () => {
      try {

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        setUser(session.user);
        
        // メッセージ履歴と統計情報を取得
        const [messageHistory, userStats] = await Promise.all([
          getMessageHistory(session.user),
          getStats(session.user)
        ]);
        
        setMessages(messageHistory);
        setStats(userStats);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleCopy = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      alert('メッセージをコピーしました！');
    } catch {
      alert('コピーに失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageTypeLabel = (type: string) => {
    return MESSAGE_TYPE_LABELS[type as keyof typeof MESSAGE_TYPE_LABELS] || type;
  };

  const getToneLabel = (tone: string) => {
    return TONE_LABELS[tone as keyof typeof TONE_LABELS] || tone;
  };

  // メッセージの改行を適切に処理する関数
  const formatMessage = (message: string) => {
    if (!message) return '';
    
    // 連続する改行を2つまでに制限
    let formatted = message.replace(/\n{3,}/g, '\n\n');
    
    // 行頭の余分な空白を削除
    formatted = formatted.replace(/^\s+/gm, '');
    
    // 行末の余分な空白を削除
    formatted = formatted.replace(/\s+$/gm, '');
    
    return formatted;
  };

  // お客様名の一覧を取得
  const customerNames = Array.from(new Set(messages.map(m => m.customer_name))).sort();

  // フィルタリングされたメッセージ
  const filteredMessages = selectedCustomer === "all" 
    ? messages 
    : messages.filter(m => m.customer_name === selectedCustomer);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← ダッシュボードに戻る
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                📋 メッセージ履歴
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto py-4 px-4">
        <div className="space-y-4">
          {/* 統計情報 */}
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4">
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
                    <p className="text-xl font-semibold text-gray-900">{stats.messageCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
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
                    <p className="text-xl font-semibold text-gray-900">{stats.customerCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
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
                    <p className="text-xl font-semibold text-gray-900">{stats.monthlyCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* フィルター */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 フィルター</CardTitle>
              <CardDescription>
                お客様別にメッセージを絞り込みます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCustomer === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCustomer("all")}
                >
                  すべて ({messages.length})
                </Button>
                {customerNames.map(name => (
                  <Button
                    key={name}
                    variant={selectedCustomer === name ? "default" : "outline"}
                    onClick={() => setSelectedCustomer(name)}
                  >
                    {name} ({messages.filter(m => m.customer_name === name).length})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* メッセージ履歴 */}
          <Card>
            <CardHeader>
              <CardTitle>📝 メッセージ履歴</CardTitle>
              <CardDescription>
                過去に作成したメッセージの一覧です
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">メッセージ履歴がありません</p>
                  <Button
                    onClick={() => router.push('/dashboard/create')}
                    className="mt-4"
                  >
                    新しいメッセージを作成
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{message.customer_name}</h3>
                          <div className="flex gap-2 mt-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {getMessageTypeLabel(message.message_type)}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {getToneLabel(message.tone)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(message.created_at)}</p>
                          <Button
                            onClick={() => handleCopy(message.generated_message)}
                            size="sm"
                            className="mt-1"
                          >
                            📋 コピー
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 font-medium">何があったか:</p>
                        <p className="text-sm text-gray-800 whitespace-pre-line">{formatMessage(message.what_happened)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 font-medium">生成されたメッセージ:</p>
                        <div className="bg-gray-50 p-3 rounded mt-1">
                          <p className="text-sm text-gray-800 whitespace-pre-line">{formatMessage(message.generated_message)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 