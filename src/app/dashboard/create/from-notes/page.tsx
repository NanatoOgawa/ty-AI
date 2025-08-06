"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { PageHeader } from "../../../../components/common/PageHeader";
import { supabase } from "../../../../lib/supabase/client";
import type { GenerateMessageFromNotesRequest, CustomerNote } from "../../../../types";
import { MESSAGE_TYPES, TONES, MESSAGE_TYPE_LABELS, TONE_LABELS } from "../../../../types";

export default function CreateFromNotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerName = searchParams.get('customer') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.THANK_YOU);
  const [tone, setTone] = useState(TONES.PROFESSIONAL);

  useEffect(() => {
    if (customerName) {
      loadCustomerNotes();
    }
  }, [customerName]);

  const loadCustomerNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const { getOrCreateCustomer, getCustomerNotes } = await import('../../../../lib/database');
      const customer = await getOrCreateCustomer(user, customerName);
      const notes = await getCustomerNotes(user, customer.id);
      
      setCustomerNotes(notes);
      
    } catch (error) {
      console.error('Error loading customer notes:', error);
      alert(error instanceof Error ? error.message : 'メモの読み込み中にエラーが発生しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      // メモをまとめて文字列に変換
      const notesText = customerNotes.map(note => 
        `[${note.note_type}] ${note.note_content}`
      ).join('\n');

      // AIメッセージを生成
      const response = await fetch('/api/generate-message-from-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          messageType,
          tone,
          notes: notesText
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メッセージの生成に失敗しました');
      }

      // データベースに保存
      try {
        const { getOrCreateCustomer, saveMessageHistory } = await import('../../../../lib/database');
        const customer = await getOrCreateCustomer(user, customerName);
        
        await saveMessageHistory(
          user,
          customer.id,
          customerName,
          `メモから生成: ${customerNotes.length}件のメモを参照`,
          messageType,
          tone,
          data.message
        );
      } catch (dbError) {
        console.error('Database save error:', dbError);
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
        title="メモからメッセージ生成" 
        showBackButton={true} 
        backUrl="/dashboard/notes"
      />

      <main className="max-w-md mx-auto py-4 px-4">
        <div className="space-y-4">
          {/* お客様情報 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">👤 {customerName}</CardTitle>
              <CardDescription className="text-sm">
                保存されたメモからメッセージを生成
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* メモ一覧 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">保存されたメモ ({customerNotes.length}件):</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {customerNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {note.note_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{note.note_content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* メッセージ設定 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-base font-medium">メッセージ種類</label>
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="thank_you">お礼</option>
                      <option value="follow_up">フォロー</option>
                      <option value="appreciation">感謝</option>
                      <option value="celebration">お祝い</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-base font-medium">トーン</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
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
                    disabled={isLoading || customerNotes.length === 0}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>生成中...</span>
                      </div>
                    ) : (
                      "✨ メモからメッセージ生成 ✨"
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