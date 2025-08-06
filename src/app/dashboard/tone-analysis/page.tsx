"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PageHeader } from "../../../components/common/PageHeader";
import { supabase } from "../../../lib/supabase/client";
import type { ToneAnalysis, UserTonePreference } from "../../../types";
import { TONE_LABELS } from "../../../types";

export default function ToneAnalysisPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis[]>([]);
  const [preferences, setPreferences] = useState<UserTonePreference[]>([]);

  useEffect(() => {
    loadToneAnalysis();
  }, []);

  const loadToneAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const { getUserToneAnalysis, getUserTonePreferences } = await import('../../../lib/database');
      const [analysis, userPreferences] = await Promise.all([
        getUserToneAnalysis(user),
        getUserTonePreferences(user)
      ]);
      
      setToneAnalysis(analysis);
      setPreferences(userPreferences);
      
    } catch (error) {
      console.error('Error loading tone analysis:', error);
      alert(error instanceof Error ? error.message : 'トーン分析の読み込み中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceUpdate = async (toneType: string, score: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const { saveUserTonePreference } = await import('../../../lib/database');
      await saveUserTonePreference(user, toneType, score);
      
      // 分析を再読み込み
      await loadToneAnalysis();
      
      alert('トーン設定を更新しました！');
      
    } catch (error) {
      console.error('Error updating preference:', error);
      alert(error instanceof Error ? error.message : 'トーン設定の更新中にエラーが発生しました');
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case '推奨':
        return 'text-green-600 bg-green-100';
      case '要調整':
        return 'text-yellow-600 bg-yellow-100';
      case '改善が必要':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.8) return 'text-green-600';
    if (rate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">トーン分析を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="トーン分析・設定" 
        showBackButton={true} 
        backUrl="/dashboard"
      />

      <main className="max-w-md mx-auto py-4 px-4">
        <div className="space-y-4">
          {/* 概要 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">🎯 トーン分析</CardTitle>
              <CardDescription>
                あなたのメッセージ生成パターンとトーン設定を分析します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                過去のメッセージ評価と使用頻度を基に、最適なトーン設定を提案します。
              </p>
            </CardContent>
          </Card>

          {/* トーン分析結果 */}
          <div className="grid grid-cols-1 gap-4">
            {toneAnalysis.map((tone) => (
              <Card key={tone.tone_type} className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <CardTitle className="text-lg">
                      {TONE_LABELS[tone.tone_type] || tone.tone_type}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(tone.recommendation)}`}>
                      {tone.recommendation}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 成功率 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">成功率</span>
                      <span className={`text-sm font-bold ${getSuccessRateColor(tone.success_rate)}`}>
                        {Math.round(tone.success_rate * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${tone.success_rate >= 0.8 ? 'bg-green-500' : tone.success_rate >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${tone.success_rate * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 使用回数 */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">使用回数</span>
                    <span className="text-sm font-bold text-gray-900">{tone.usage_count}回</span>
                  </div>

                  {/* トーン設定 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">設定値</span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round(tone.score * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={tone.score}
                      onChange={(e) => handlePreferenceUpdate(tone.tone_type, parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>低</span>
                      <span>高</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 推奨設定 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">💡 推奨設定</CardTitle>
              <CardDescription>
                分析結果に基づくトーン設定の提案
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {toneAnalysis
                  .filter(tone => tone.recommendation === '推奨')
                  .map((tone) => (
                    <div key={tone.tone_type} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium text-green-800">
                          {TONE_LABELS[tone.tone_type] || tone.tone_type}
                        </span>
                        <p className="text-sm text-green-600">
                          成功率 {Math.round(tone.success_rate * 100)}% - このトーンが効果的です
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePreferenceUpdate(tone.tone_type, 0.8)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        推奨設定に変更
                      </Button>
                    </div>
                  ))}
                
                {toneAnalysis
                  .filter(tone => tone.recommendation === '改善が必要')
                  .map((tone) => (
                    <div key={tone.tone_type} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <span className="font-medium text-red-800">
                          {TONE_LABELS[tone.tone_type] || tone.tone_type}
                        </span>
                        <p className="text-sm text-red-600">
                          成功率 {Math.round(tone.success_rate * 100)}% - 改善が必要です
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePreferenceUpdate(tone.tone_type, 0.3)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        使用頻度を下げる
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 