"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { supabase } from "../../../lib/supabase/client";

interface CustomerInfo {
  customerName: string;
  whatHappened: string;
  messageType: string;
  tone: string;
}

export default function CreateMessagePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: "",
    whatHappened: "",
    messageType: "thank_you",
    tone: "professional"
  });

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 現在のユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      // AIメッセージを生成
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerInfo),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メッセージの生成に失敗しました');
      }

      // データベースに保存
      try {
        console.log('Saving to database...');
        
        // お客様情報を取得または作成
        const { getOrCreateCustomer, saveMessageHistory } = await import('../../../lib/database');
        const customer = await getOrCreateCustomer(user, customerInfo.customerName);
        
        // メッセージ履歴を保存
        await saveMessageHistory(
          user,
          customer.id,
          customerInfo.customerName,
          customerInfo.whatHappened,
          customerInfo.messageType,
          customerInfo.tone,
          data.message
        );
        
        console.log('Successfully saved to database');
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // データベース保存に失敗してもメッセージ生成は成功させる
      }

      // 結果ページにリダイレクト
      const messageParam = encodeURIComponent(data.message);
      const noteParam = data.note ? encodeURIComponent(data.note) : '';
      router.push(`/dashboard/create/result?message=${messageParam}&note=${noteParam}`);
      
    } catch (error) {
      console.error('Error generating message:', error);
      alert(error instanceof Error ? error.message : 'メッセージの生成中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

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
                新規メッセージ作成
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 簡潔な入力フォーム */}
            <Card>
              <CardHeader>
                <CardTitle>📝 簡単入力フォーム</CardTitle>
                <CardDescription>
                  仕事の合間に素早く入力できるよう、必要最小限の項目にしました
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. お客様名 */}
                <div>
                  <Label htmlFor="customerName" className="text-lg font-medium">
                    1️⃣ お客様のお名前 *
                  </Label>
                  <Input
                    id="customerName"
                    value={customerInfo.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="例: 田中さん、佐藤様"
                    className="mt-2 text-lg"
                    required
                  />
                </div>

                {/* 2. 何があったか */}
                <div>
                  <Label htmlFor="whatHappened" className="text-lg font-medium">
                    2️⃣ 何があったか *
                  </Label>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                      箇条書きで簡単に書いてください：
                    </p>
                    <Textarea
                      id="whatHappened"
                      value={customerInfo.whatHappened}
                      onChange={(e) => handleInputChange('whatHappened', e.target.value)}
                      placeholder={`• 商品を購入してくれた
• 紹介してくれた
• サポートしてくれた
• 会議に参加してくれた
など`}
                      rows={6}
                      className="text-base"
                      required
                    />
                  </div>
                </div>

                {/* 3. メッセージ設定 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="messageType" className="text-lg font-medium">
                      3️⃣ メッセージの種類
                    </Label>
                    <select
                      id="messageType"
                      value={customerInfo.messageType}
                      onChange={(e) => handleInputChange('messageType', e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    >
                      <option value="thank_you">お礼メッセージ</option>
                      <option value="follow_up">フォローアップ</option>
                      <option value="appreciation">感謝のメッセージ</option>
                      <option value="celebration">お祝いメッセージ</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="tone" className="text-lg font-medium">
                      4️⃣ トーン
                    </Label>
                    <select
                      id="tone"
                      value={customerInfo.tone}
                      onChange={(e) => handleInputChange('tone', e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    >
                      <option value="professional">ビジネスライク</option>
                      <option value="friendly">親しみやすい</option>
                      <option value="formal">フォーマル</option>
                      <option value="casual">カジュアル</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 生成ボタン */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>AIメッセージ生成中...</span>
                  </div>
                ) : (
                  "✨ AIメッセージを生成 ✨"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 