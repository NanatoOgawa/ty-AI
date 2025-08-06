"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface TestResult {
  url: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message?: string;
  duration?: number;
}

export default function NavigationTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const router = useRouter();

  const testUrls = [
    { path: '/', name: 'ホーム' },
    { path: '/login', name: 'ログイン' },
    { path: '/dashboard', name: 'ダッシュボード' },
    { path: '/dashboard/customers', name: 'お客様管理' },
    { path: '/dashboard/history', name: 'メッセージ履歴' },
    { path: '/dashboard/tone-analysis', name: 'トーン分析' },
    { path: '/dashboard/notes', name: 'メモ管理' },
    { path: '/dashboard/create', name: 'メッセージ作成' },
    { path: '/dashboard/create/from-notes', name: 'メモから作成' },
    { path: '/dashboard/create/result', name: '作成結果' }
  ];

  const testNavigation = async () => {
    setIsTesting(true);
    setResults([]);

    for (const testUrl of testUrls) {
      const startTime = Date.now();
      
      try {
        console.log(`🔍 テスト中: ${testUrl.path}`);
        
        // 遷移テスト
        router.push(testUrl.path);
        
        // 少し待機
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const duration = Date.now() - startTime;
        
        setResults(prev => [...prev, {
          url: testUrl.path,
          status: 'success',
          message: `${testUrl.name}への遷移が成功しました`,
          duration
        }]);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        setResults(prev => [...prev, {
          url: testUrl.path,
          status: 'error',
          message: `エラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
          duration
        }]);
      }
    }
    
    setIsTesting(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '⏳';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🚀 遷移テストツール</CardTitle>
        <CardDescription>
          アプリケーション内の各ページへの遷移をテストします
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testNavigation} 
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? 'テスト中...' : '遷移テスト開始'}
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
              disabled={isTesting}
            >
              結果をクリア
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">テスト結果:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border rounded-lg ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{getStatusIcon(result.status)}</span>
                        <span className="font-mono text-sm">{result.url}</span>
                      </div>
                      {result.duration && (
                        <span className="text-xs text-gray-500">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                    {result.message && (
                      <p className="text-sm mt-1">{result.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isTesting && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">遷移テストを実行中...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 