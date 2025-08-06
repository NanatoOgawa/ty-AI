"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { PageHeader } from "../../../../components/common/PageHeader";
import { supabase } from "../../../../lib/supabase/client";
import type { CustomerNote } from "../../../../types";
import { MESSAGE_TYPES, TONES } from "../../../../types";

function CreateFromNotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerName = searchParams.get('customer') || '';
  const selectedNotesParam = searchParams.get('notes') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [messageType, setMessageType] = useState<string>(MESSAGE_TYPES.THANK_YOU);
  const [tone, setTone] = useState<string>(TONES.PROFESSIONAL);

  const loadCustomerNotes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const { getOrCreateCustomer, getCustomerNotes } = await import('../../../../lib/database');
      const customer = await getOrCreateCustomer(user, customerName);
      const notes = await getCustomerNotes(user, customer.id);
      
      setCustomerNotes(notes);
      
      // URLパラメータから選択されたメモのIDを取得
      if (selectedNotesParam) {
        const selectedNoteIds = selectedNotesParam.split(',').filter(id => id.trim() !== '');
        const validNoteIds = new Set(selectedNoteIds.filter(id => 
          notes.some(note => note.id === id)
        ));
        setSelectedNotes(validNoteIds);
      } else {
        // パラメータがない場合はすべてのメモを選択
        setSelectedNotes(new Set(notes.map(note => note.id)));
      }
      
    } catch (error) {
      console.error('Error loading customer notes:', error);
      alert(error instanceof Error ? error.message : 'メモの読み込み中にエラーが発生しました');
    }
  }, [customerName, selectedNotesParam]);

  useEffect(() => {
    if (customerName) {
      loadCustomerNotes();
    }
  }, [customerName, loadCustomerNotes]);

  const handleNoteToggle = (noteId: string) => {
    const newSelectedNotes = new Set(selectedNotes);
    if (newSelectedNotes.has(noteId)) {
      newSelectedNotes.delete(noteId);
    } else {
      newSelectedNotes.add(noteId);
    }
    setSelectedNotes(newSelectedNotes);
  };

  const handleSelectAll = () => {
    if (selectedNotes.size === customerNotes.length) {
      // すべて選択されている場合はすべて解除
      setSelectedNotes(new Set());
    } else {
      // すべて選択
      setSelectedNotes(new Set(customerNotes.map(note => note.id)));
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

      // 選択されたメモのみを取得
      const selectedNotesList = customerNotes.filter(note => selectedNotes.has(note.id));
      
      if (selectedNotesList.length === 0) {
        throw new Error('メモを1つ以上選択してください');
      }

      // メモの内容をまとめる
      const notesContent = selectedNotesList.map(note => 
        `[${note.note_type}] ${note.note_content}`
      ).join('\n\n');

      // AIメッセージを生成
      const response = await fetch('/api/generate-message-from-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          notesContent,
          messageType,
          tone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メッセージの生成に失敗しました');
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

  if (!customerName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600">お客様名が指定されていません</p>
          <Button 
            onClick={() => router.push('/dashboard/customers')}
            className="mt-4"
          >
            お客様管理に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="メモからメッセージ作成" 
        showBackButton={true} 
        backUrl="/dashboard/customers"
      />

      <main className="max-w-md mx-auto py-4 px-4">
        <div className="space-y-4">
          {/* ヘッダー */}
          <Card className="border-0 shadow-lg bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900">
                📝 {customerName} のメモからメッセージ作成
              </CardTitle>
              <CardDescription className="text-blue-700">
                選択したメモの内容を基にAIがメッセージを生成します
              </CardDescription>
            </CardHeader>
          </Card>

          {/* メモ選択 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">📋 メモ選択</CardTitle>
              <CardDescription>
                メッセージ生成に使用するメモを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 全選択/解除ボタン */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {selectedNotes.size} / {customerNotes.length} 件選択中
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedNotes.size === customerNotes.length ? 'すべて解除' : 'すべて選択'}
                </Button>
              </div>

              {/* メモ一覧 */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {customerNotes.map((note) => (
                  <div key={note.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={selectedNotes.has(note.id)}
                      onCheckedChange={() => handleNoteToggle(note.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {note.note_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                        {note.note_content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* メッセージ設定 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">⚙️ メッセージ設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メッセージ種類
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as string)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="thank_you">お礼</option>
                    <option value="follow_up">フォロー</option>
                    <option value="appreciation">感謝</option>
                    <option value="celebration">お祝い</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    トーン
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as string)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="professional">ビジネス</option>
                    <option value="friendly">親しみ</option>
                    <option value="formal">フォーマル</option>
                    <option value="casual">カジュアル</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 生成ボタン */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || selectedNotes.size === 0}
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CreateFromNotesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <CreateFromNotesContent />
    </Suspense>
  );
} 