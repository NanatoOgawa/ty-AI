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
import { getUserProfile, saveUserProfile, updateUserProfile } from "../../../lib/database/index";
import type { UserProfile } from "../../../types";
import type { User } from "@supabase/supabase-js";
import { STORE_TYPES, PERSONALITY_TYPES, SPEAKING_STYLES, AGE_RANGES, WORK_SCHEDULES } from "../../../types";
import MobileNavigation from "../../../components/common/MobileNavigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    work_name: "",
    store_type: "",
    experience_years: 0,
    personality_type: "",
    speaking_style: "",
    age_range: "",
    specialty_topics: "",
    work_schedule: ""
  });

  const checkAuthAndLoadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      
      // プロフィールを読み込み
      const userProfile = await getUserProfile(session.user);
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          work_name: userProfile.work_name || "",
          store_type: userProfile.store_type || "",
          experience_years: userProfile.experience_years || 0,
          personality_type: userProfile.personality_type || "",
          speaking_style: userProfile.speaking_style || "",
          age_range: userProfile.age_range || "",
          specialty_topics: userProfile.specialty_topics || "",
          work_schedule: userProfile.work_schedule || ""
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, [checkAuthAndLoadProfile]);

  const handleSave = async () => {
    if (!user) return;

    if (!formData.work_name.trim()) {
      alert('源氏名を入力してください');
      return;
    }

    try {
      setIsLoading(true);
      
      if (profile) {
        // 更新
        await updateUserProfile(user, profile.id, formData);
        alert('プロフィールを更新しました！');
      } else {
        // 新規作成
        const newProfile = await saveUserProfile(user, formData);
        setProfile(newProfile);
        alert('プロフィールを保存しました！');
      }
      
      // 再読み込み
      await checkAuthAndLoadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('プロフィールの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader 
        title="プロフィール設定" 
        showBackButton={true}
        backUrl="/dashboard"
      />
      
      <main className="max-w-md mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              あなたのプロフィール
            </CardTitle>
            <CardDescription>
              より個別化されたメッセージ生成のために、あなたの情報を教えてください
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 源氏名 */}
            <div>
              <Label htmlFor="work_name" className="text-base font-medium">
                源氏名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="work_name"
                value={formData.work_name}
                onChange={(e) => setFormData({...formData, work_name: e.target.value})}
                placeholder="あなたの源氏名"
                className="mt-2"
              />
            </div>

            {/* 店舗タイプ */}
            <div>
              <Label htmlFor="store_type" className="text-base font-medium">
                店舗タイプ
              </Label>
              <select
                id="store_type"
                value={formData.store_type}
                onChange={(e) => setFormData({...formData, store_type: e.target.value})}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">選択してください</option>
                {STORE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 経験年数 */}
            <div>
              <Label htmlFor="experience_years" className="text-base font-medium">
                経験年数
              </Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                placeholder="年数を入力"
                className="mt-2"
              />
            </div>

            {/* 性格タイプ */}
            <div>
              <Label htmlFor="personality_type" className="text-base font-medium">
                性格・キャラクター
              </Label>
              <select
                id="personality_type"
                value={formData.personality_type}
                onChange={(e) => setFormData({...formData, personality_type: e.target.value})}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">選択してください</option>
                {PERSONALITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 話し方 */}
            <div>
              <Label htmlFor="speaking_style" className="text-base font-medium">
                話し方・言葉遣い
              </Label>
              <select
                id="speaking_style"
                value={formData.speaking_style}
                onChange={(e) => setFormData({...formData, speaking_style: e.target.value})}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">選択してください</option>
                {SPEAKING_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 年齢層 */}
            <div>
              <Label htmlFor="age_range" className="text-base font-medium">
                年齢層
              </Label>
              <select
                id="age_range"
                value={formData.age_range}
                onChange={(e) => setFormData({...formData, age_range: e.target.value})}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">選択してください</option>
                {AGE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 得意な話題 */}
            <div>
              <Label htmlFor="specialty_topics" className="text-base font-medium">
                得意な話題・趣味
              </Label>
              <Textarea
                id="specialty_topics"
                value={formData.specialty_topics}
                onChange={(e) => setFormData({...formData, specialty_topics: e.target.value})}
                placeholder="お客様と話すのが得意な話題や、あなたの趣味・興味のあることを教えてください"
                rows={3}
                className="mt-2"
              />
            </div>

            {/* 勤務時間帯 */}
            <div>
              <Label htmlFor="work_schedule" className="text-base font-medium">
                主な勤務時間帯
              </Label>
              <select
                id="work_schedule"
                value={formData.work_schedule}
                onChange={(e) => setFormData({...formData, work_schedule: e.target.value})}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">選択してください</option>
                {WORK_SCHEDULES.map((schedule) => (
                  <option key={schedule.value} value={schedule.value}>
                    {schedule.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 保存ボタン */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading || !formData.work_name.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 touch-manipulation"
              >
                {isLoading ? '保存中...' : profile ? 'プロフィールを更新' : 'プロフィールを保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
