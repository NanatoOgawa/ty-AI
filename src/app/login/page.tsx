"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export default function LoginPage() {
  const [redirectUrl, setRedirectUrl] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("Login page: Component mounted");
    
    // デバッグ情報を収集
    const debugData = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
    
    console.log("Login page debug info:", debugData);
    setDebugInfo(JSON.stringify(debugData, null, 2));

    // クライアントサイドでのみwindowオブジェクトにアクセス
    const url = `${window.location.origin}/dashboard`;
    console.log("Login page: Setting redirect URL to:", url);
    setRedirectUrl(url);

    // 初期認証状態をチェック
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Login page: Initial session check:", { hasSession: !!session });
        
        if (session && !isRedirecting) {
          console.log("Login page: User already authenticated, redirecting to dashboard");
          setIsRedirecting(true);
          // 少し遅延を入れてリダイレクト
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
          return;
        }
      } catch (error) {
        console.error("Login page: Error checking auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();

    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Login page: Auth state change:", { event, session: !!session });
      
      if (event === 'SIGNED_IN' && session && !isRedirecting) {
        console.log("Login page: User signed in, redirecting to dashboard");
        setIsRedirecting(true);
        // 少し遅延を入れてリダイレクト
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      }
    });

    // CSPエラーの監視
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      console.log("Login page: Error detected:", errorMessage);
      if (errorMessage.includes('Content Security Policy') || errorMessage.includes('eval')) {
        setError(prev => prev + "\nCSP Error: " + errorMessage);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
      subscription.unsubscribe();
    };
  }, [router, isRedirecting]);

  // リダイレクト中はローディング表示
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ダッシュボードに移動中...</p>
        </div>
      </div>
    );
  }

  // ローディング中は何も表示しない
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">リピートつながるAI</h1>
          <p className="mt-2 text-sm text-gray-600">
            お客様との関係を深めるAIお礼メッセージジェネレーター
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>
              アカウントにログインしてサービスをご利用ください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600 whitespace-pre-wrap">
                  エラー: {error}
                </p>
              </div>
            )}

            {debugInfo && (
              <details className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  デバッグ情報
                </summary>
                <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                  {debugInfo}
                </pre>
              </details>
            )}

            {redirectUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  リダイレクト先: {redirectUrl}
                </p>
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: "#3b82f6",
                          brandAccent: "#2563eb",
                        },
                      },
                    },
                  }}
                  providers={["google"]}
                  redirectTo={redirectUrl}
                  onError={(error) => {
                    console.error("Login page: Auth error:", error);
                    setError(error.message);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
