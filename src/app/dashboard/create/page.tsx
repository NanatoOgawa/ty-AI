"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { PageHeader } from "../../../components/common/PageHeader";
import { supabase } from "../../../lib/supabase/client";
import type { GenerateMessageRequest } from "../../../types";
import { MESSAGE_TYPES, TONES } from "../../../types";

export default function CreateMessagePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<GenerateMessageRequest>({
    customerName: "",
    whatHappened: "",
    messageType: MESSAGE_TYPES.THANK_YOU,
    tone: TONES.PROFESSIONAL
  });

  const handleInputChange = (field: keyof GenerateMessageRequest, value: string) => {
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
      <PageHeader 
        title="新規メッセージ作成" 
        showBackButton={true} 
        backUrl="/dashboard"
      />

      <main className="max-w-md mx-auto py-4 px-4">
        <div className="space-y-4">
          {/* 入力フォーム */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">💬 メッセージ作成</CardTitle>
              <CardDescription className="text-sm">
                隙間時間でサクッと作成
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. お客様名 */}
                <div>
                  <Label htmlFor="customerName" className="text-base font-medium">
                    1️⃣ お客様名 *
                  </Label>
                  <Input
                    id="customerName"
                    value={customerInfo.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="田中さん、佐藤様"
                    className="mt-2 text-base"
                    required
                  />
                </div>

                {/* 2. 何があったか */}
                <div>
                  <Label htmlFor="whatHappened" className="text-base font-medium">
                    2️⃣ 何があったか *
                  </Label>
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-600">
                      箇条書きで簡単に：
                    </p>
                    <Textarea
                      id="whatHappened"
                      value={customerInfo.whatHappened}
                      onChange={(e) => handleInputChange('whatHappened', e.target.value)}
                      placeholder={`• 商品を購入してくれた
• 紹介してくれた
• サポートしてくれた`}
                      rows={4}
                      className="text-sm"
                      required
                    />
                  </div>
                </div>

                {/* 3. メッセージ設定 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="messageType" className="text-base font-medium">
                      3️⃣ 種類
                    </Label>
                    <select
                      id="messageType"
                      value={customerInfo.messageType}
                      onChange={(e) => handleInputChange('messageType', e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="thank_you">お礼</option>
                      <option value="follow_up">フォロー</option>
                      <option value="appreciation">感謝</option>
                      <option value="celebration">お祝い</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="tone" className="text-base font-medium">
                      4️⃣ トーン
                    </Label>
                    <select
                      id="tone"
                      value={customerInfo.tone}
                      onChange={(e) => handleInputChange('tone', e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="professional">ビジネス</option>
                      <option value="friendly">親しみ</option>
                      <option value="formal">フォーマル</option>
                      <option value="casual">カジュアル</option>
                    </select>
                  </div>
                </div>

                {/* 生成ボタン */}
                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>生成中...</span>
                      </div>
                    ) : (
                      "✨ AIメッセージ生成 ✨"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 