"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { PageHeader } from "../../../components/common/PageHeader";
import { supabase } from "../../../lib/supabase/client";
import type { CustomerNote } from "../../../types";
import MobileNavigation from "../../../components/common/MobileNavigation";

export default function NotesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error("Auth error:", error);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const { getOrCreateCustomer, saveCustomerNote } = await import('../../../lib/database');
      const customer = await getOrCreateCustomer(user, customerName);
      
      await saveCustomerNote(user, customer.id, noteContent, noteType);

      // フォームをリセット
      setCustomerName("");
      setNoteContent("");
      setNoteType("general");

      alert('メモを保存しました！');
      
    } catch (error) {
      console.error('Error saving note:', error);
      alert(error instanceof Error ? error.message : 'メモの保存中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadNotes = async () => {
    if (!selectedCustomer) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const { getOrCreateCustomer, getCustomerNotes } = await import('../../../lib/database');
      const customer = await getOrCreateCustomer(user, selectedCustomer);
      const customerNotes = await getCustomerNotes(user, customer.id);
      
      setNotes(customerNotes);
      // 初期状態ではすべてのメモを選択
      setSelectedNotes(new Set(customerNotes.map(note => note.id)));
      
    } catch (error) {
      console.error('Error loading notes:', error);
      alert(error instanceof Error ? error.message : 'メモの読み込み中にエラーが発生しました');
    }
  };

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
    if (selectedNotes.size === notes.length) {
      // すべて選択されている場合はすべて解除
      setSelectedNotes(new Set());
    } else {
      // すべて選択
      setSelectedNotes(new Set(notes.map(note => note.id)));
    }
  };

  const handleGenerateMessage = () => {
    if (!selectedCustomer) {
      alert('お客様を選択してください');
      return;
    }
    
    if (selectedNotes.size === 0) {
      alert('メモを1つ以上選択してください');
      return;
    }
    
    try {
      // 選択されたメモのIDをカンマ区切りでエンコード
      const selectedNotesParam = Array.from(selectedNotes).join(',');
      const customerParam = encodeURIComponent(selectedCustomer);
      const url = `/dashboard/create/from-notes?customer=${customerParam}&notes=${selectedNotesParam}`;
      console.log('Navigating to:', url);
      router.push(url);
    } catch (error) {
      console.error('Error navigating to create from notes:', error);
      alert('画面遷移中にエラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader 
        title="お客様メモ管理" 
        showBackButton={true} 
        backUrl="/dashboard"
      />

      <main className="max-w-md mx-auto py-4 px-4">
        <div className="space-y-4">
          {/* メモ作成フォーム */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">📝 メモ作成</CardTitle>
              <CardDescription className="text-sm">
                お客様の情報をメモとして保存
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* お客様名 */}
                <div>
                  <Label htmlFor="customerName" className="text-base font-medium">
                    お客様名 *
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="田中さん、佐藤様"
                    className="mt-2 text-base"
                    required
                  />
                </div>

                {/* メモ内容 */}
                <div>
                  <Label htmlFor="noteContent" className="text-base font-medium">
                    メモ内容 *
                  </Label>
                  <Textarea
                    id="noteContent"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="お客様の好み、過去のやり取り、重要な情報などを記録"
                    rows={4}
                    className="mt-2 text-sm"
                    required
                  />
                </div>

                {/* メモタイプ */}
                <div>
                  <Label htmlFor="noteType" className="text-base font-medium">
                    メモタイプ
                  </Label>
                  <select
                    id="noteType"
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="general">一般</option>
                    <option value="preference">好み</option>
                    <option value="history">過去のやり取り</option>
                    <option value="important">重要情報</option>
                    <option value="reminder">リマインダー</option>
                  </select>
                </div>

                {/* 保存ボタン */}
                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>保存中...</span>
                      </div>
                    ) : (
                      "💾 メモを保存"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* メモ読み込み・メッセージ生成 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">📋 メモ確認・メッセージ生成</CardTitle>
              <CardDescription className="text-sm">
                保存したメモからメッセージを生成
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* お客様選択 */}
              <div>
                <Label htmlFor="selectedCustomer" className="text-base font-medium">
                  お客様を選択
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="selectedCustomer"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    placeholder="お客様名を入力"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleLoadNotes}
                    className="px-4"
                  >
                    読み込み
                  </Button>
                </div>
              </div>

              {/* メモ一覧 */}
              {notes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">保存されたメモ:</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-xs"
                    >
                      {selectedNotes.size === notes.length ? 'すべて解除' : 'すべて選択'}
                    </Button>
                  </div>
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={note.id}
                          checked={selectedNotes.has(note.id)}
                          onCheckedChange={() => handleNoteToggle(note.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
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
                      </div>
                    </div>
                  ))}
                  
                  {/* メッセージ生成ボタン */}
                  <Button
                    type="button"
                    onClick={handleGenerateMessage}
                    disabled={selectedNotes.size === 0}
                    className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✨ 選択したメモからメッセージ生成 ({selectedNotes.size}件選択)
                  </Button>
                </div>
              )}

              {notes.length === 0 && selectedCustomer && (
                <div className="text-center py-4 text-gray-500">
                  このお客様のメモはまだありません
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* モバイルナビゲーション */}
      <MobileNavigation />
    </div>
  );
} 