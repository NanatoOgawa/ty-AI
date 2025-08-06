"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { PageHeader } from "../../../../components/common/PageHeader";
import { supabase } from "../../../../lib/supabase/client";
import type { GenerateMessageResponse } from "../../../../types";

export default function MessageResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<GenerateMessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

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

  const handleRating = async (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingSubmit = async () => {
    if (!rating || !result) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      // メッセージ履歴から最新のメッセージIDを取得
      const { data: messages, error: fetchError } = await supabase
        .from('message_history')
        .select('id, tone')
        .eq('user_id', user.id)
        .eq('generated_message', result.message)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError || !messages || messages.length === 0) {
        throw new Error('メッセージ履歴が見つかりません');
      }

      const { saveMessageRating, updateToneUsageCount } = await import('../../../../lib/database');
      
      // 評価を保存
      await saveMessageRating(user, messages[0].id, rating, messages[0].tone, feedback);
      
      // トーン使用回数を更新
      await updateToneUsageCount(user, messages[0].tone);
      
      setIsRatingSubmitted(true);
      alert('評価を送信しました！ありがとうございます。');
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error instanceof Error ? error.message : '評価の送信中にエラーが発生しました');
    }
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

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600">{error || 'メッセージデータが見つかりません'}</p>
          <Button 
            onClick={() => router.push('/dashboard/create')}
            className="mt-4"
          >
            新規メッセージ作成に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="メッセージ生成完了" 
        showBackButton={true} 
        backUrl="/dashboard"
      />

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

          {/* メッセージ評価 */}
          {!isRatingSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle>⭐ メッセージ評価</CardTitle>
                <CardDescription>
                  このメッセージの品質を評価してください（トーン調整に使用されます）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 評価スター */}
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={`text-2xl ${
                        rating && rating >= star ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                
                {rating && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      評価: {rating} / 5
                    </p>
                  </div>
                )}

                {/* フィードバック */}
                {rating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      フィードバック（任意）
                    </label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="このメッセージについての感想や改善点があれば教えてください"
                      rows={3}
                      className="w-full"
                    />
                  </div>
                )}

                {/* 評価送信ボタン */}
                {rating && (
                  <div className="text-center">
                    <Button
                      onClick={handleRatingSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      評価を送信
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleCopy}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              📋 メッセージをコピー
            </Button>
            
            <Button
              onClick={handleNewMessage}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              ✨ 新しいメッセージを作成
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 