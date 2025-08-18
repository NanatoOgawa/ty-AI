"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { PageHeader } from "../../../components/common/PageHeader";
import { supabase } from "../../../lib/supabase/client";
import type { Customer } from "../../../types";
import MobileNavigation from "../../../components/common/MobileNavigation";

interface CustomerFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
  preferences: string;
  important_notes: string;
  birthday: string;
  anniversary: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    company: "",
    email: "",
    phone: "",
    relationship: "",
    preferences: "",
    important_notes: "",
    birthday: "",
    anniversary: ""
  });

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
    loadCustomers();
  }, [checkAuth]);

  const loadCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Database error:', error);
        throw new Error(`お客様情報の読み込み中にエラーが発生しました: ${error.message}`);
      }
      
      setCustomers(data || []);
      console.log(`Loaded ${data?.length || 0} customers`);
      
    } catch (error) {
      console.error('Error loading customers:', error);
      alert(error instanceof Error ? error.message : 'お客様情報の読み込み中にエラーが発生しました');
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

      if (!formData.name || formData.name.trim() === '') {
        throw new Error('お客様名は必須です');
      }

      const customerData = {
        user_id: user.id,
        name: formData.name.trim(),
        company: formData.company?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        relationship: formData.relationship?.trim() || null,
        preferences: formData.preferences?.trim() || null,
        important_notes: formData.important_notes?.trim() || null,
        birthday: formData.birthday?.trim() || null,
        anniversary: formData.anniversary?.trim() || null
      };

      if (editingCustomer) {
        // 更新
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomer.id);

        if (error) {
          console.error('Update error:', error);
          throw new Error(`お客様情報の更新中にエラーが発生しました: ${error.message}`);
        }
        alert('お客様情報を更新しました！');
      } else {
        // 新規作成
        const { error } = await supabase
          .from('customers')
          .insert([customerData]);

        if (error) {
          console.error('Insert error:', error);
          throw new Error(`お客様情報の登録中にエラーが発生しました: ${error.message}`);
        }
        alert('お客様情報を登録しました！');
      }

      // フォームをリセット
      resetForm();
      loadCustomers();
      
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(error instanceof Error ? error.message : 'お客様情報の保存中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    // 新しいお客様の情報でフォームを更新
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      relationship: customer.relationship || "",
      preferences: customer.preferences || "",
      important_notes: customer.important_notes || "",
      birthday: customer.birthday || "",
      anniversary: customer.anniversary || ""
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('このお客様情報を削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
      alert('お客様情報を削除しました！');
      loadCustomers();
      
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(error instanceof Error ? error.message : 'お客様情報の削除中にエラーが発生しました');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      relationship: "",
      preferences: "",
      important_notes: "",
      birthday: "",
      anniversary: ""
    });
    setEditingCustomer(null);
    setIsFormOpen(false);
  };

  const handleCreateMessage = (customer: Customer) => {
    try {
      const customerParam = encodeURIComponent(customer.name);
      const url = `/dashboard/create?customer=${customerParam}`;
      console.log('Navigating to:', url);
      router.push(url);
    } catch (error) {
      console.error('Error navigating to create message:', error);
      alert('画面遷移中にエラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader 
        title="お客様管理" 
        showBackButton={true} 
        backUrl="/dashboard"
      />

      <main className="max-w-md mx-auto py-4 px-4">
        <div className="space-y-4">
          {/* ヘッダー */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">お客様一覧</h2>
              <p className="text-sm sm:text-base text-gray-600">登録済みのお客様情報を管理できます</p>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              ✨ 新規登録
            </Button>
          </div>

          {/* お客様登録・編集フォーム */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50 p-4">
              <Card className="border-0 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">
                        {editingCustomer ? '📝 お客様情報編集' : '✨ 新規お客様登録'}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {editingCustomer ? 'お客様の情報を更新します' : '新しいお客様の情報を登録します'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 基本情報 */}
                      <div>
                        <Label htmlFor="name" className="text-base font-medium">
                          お客様名 *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="田中太郎"
                          className="mt-2"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="company" className="text-base font-medium">
                          会社名
                        </Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          placeholder="株式会社サンプル"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-base font-medium">
                          メールアドレス
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="tanaka@example.com"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-base font-medium">
                          電話番号
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="090-1234-5678"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="relationship" className="text-base font-medium">
                          関係性
                        </Label>
                        <Input
                          id="relationship"
                          value={formData.relationship}
                          onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                          placeholder="取引先、友人、家族など"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="birthday" className="text-base font-medium">
                          誕生日
                        </Label>
                        <Input
                          id="birthday"
                          type="date"
                          value={formData.birthday}
                          onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="anniversary" className="text-base font-medium">
                          記念日
                        </Label>
                        <Input
                          id="anniversary"
                          type="date"
                          value={formData.anniversary}
                          onChange={(e) => setFormData({...formData, anniversary: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {/* 詳細情報 */}
                    <div>
                      <Label htmlFor="preferences" className="text-base font-medium">
                        好み・趣味
                      </Label>
                      <Textarea
                        id="preferences"
                        value={formData.preferences}
                        onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                        placeholder="お客様の好み、趣味、興味のあることなど"
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="important_notes" className="text-base font-medium">
                        重要なメモ
                      </Label>
                      <Textarea
                        id="important_notes"
                        value={formData.important_notes}
                        onChange={(e) => setFormData({...formData, important_notes: e.target.value})}
                        placeholder="重要な情報、注意点、過去のやり取りなど"
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {/* ボタン */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="px-6"
                      >
                        キャンセル
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>保存中...</span>
                          </div>
                        ) : (
                          editingCustomer ? '更新' : '登録'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* お客様一覧 */}
          <div className="grid grid-cols-1 gap-4">
            {customers.map((customer) => (
              <Card key={customer.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      {customer.company && (
                        <CardDescription className="text-sm">
                          {customer.company}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex space-x-1 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(customer)}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        編集
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(customer.id)}
                        className="text-xs text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customer.email && (
                    <div className="text-sm">
                      <span className="font-medium">📧</span> {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="text-sm">
                      <span className="font-medium">📞</span> {customer.phone}
                    </div>
                  )}
                  {customer.relationship && (
                    <div className="text-sm">
                      <span className="font-medium">👥</span> {customer.relationship}
                    </div>
                  )}
                  {customer.preferences && (
                    <div className="text-sm">
                      <span className="font-medium">🎯</span> {customer.preferences.substring(0, 50)}
                      {customer.preferences.length > 50 && '...'}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateMessage(customer)}
                      className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs"
                    >
                      ✨ メッセージ作成
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/notes?customer=${encodeURIComponent(customer.name)}`)}
                      className="w-full sm:flex-1 text-xs"
                    >
                      📝 メモ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {customers.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">お客様が登録されていません</h3>
              <p className="text-gray-600 mb-4">新規登録ボタンからお客様情報を追加してください</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                ✨ 新規登録
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* モバイルナビゲーション */}
      <MobileNavigation />
    </div>
  );
} 