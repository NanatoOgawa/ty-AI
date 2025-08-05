"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import type { GenerateMessageResponse } from "../../../../types";

export default function MessageResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<GenerateMessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const messageData = searchParams.get('message');
        const noteData = searchParams.get('note');
        
        if (messageData) {
          setResult({
            message: decodeURIComponent(messageData),
            note: noteData ? decodeURIComponent(noteData) : undefined
          });
        } else {
          setError('メッセージデータが見つかりません');
        }
      } catch (error) {
        setError('メッセージの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [searchParams]);

  const handleCopy = async () => {
    if (result?.message) {
      try {
        await navigator.clipboard.writeText(result.message);
        alert('メッセージをコピーしました！');
      } catch (error) {
        alert('コピーに失敗しました');
      }
    }
  };

  const handleNewMessage = () => {
    router.push('/dashboard/create');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">メッセージを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                  エラー
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-600 text-center">{error}</p>
                <div className="mt-4 flex justify-center space-x-4">
                  <Button onClick={() => router.push('/dashboard/create')}>
                    新規作成に戻る
                  </Button>
                  <Button onClick={() => router.push('/dashboard')} variant="outline">
                    ダッシュボードに戻る
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
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
                ✨ AIメッセージ生成完了 ✨
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* 成功メッセージ */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  AIメッセージが生成されました！
                </h2>
                <p className="text-green-600">
                  以下のメッセージをお客様にお送りください
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 生成されたメッセージ */}
          <Card>
            <CardHeader>
              <CardTitle>📝 生成されたメッセージ</CardTitle>
              <CardDescription>
                コピーしてメールやSNSでお客様にお送りください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <pre className="whitespace-pre-wrap text-gray-800 font-medium leading-relaxed">
                  {result?.message}
                </pre>
              </div>
              
              {result?.note && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{result.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleCopy}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3"
                >
                  📋 メッセージをコピー
                </Button>
                <Button
                  onClick={handleNewMessage}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
                >
                  ✨ 新しいメッセージを作成
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="px-6 py-3"
                >
                  🏠 ダッシュボードに戻る
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ヒント */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">💡 活用のヒント</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-blue-700">
                <li>• メッセージをコピーしてメールやSNSで送信</li>
                <li>• 必要に応じて文章を調整してから送信</li>
                <li>• 定期的にお客様にお礼メッセージを送ることで関係性を強化</li>
                <li>• 同じお客様には異なる内容のメッセージを送ることをお勧め</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 