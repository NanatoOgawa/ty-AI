"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [useFallbackAuth, setUseFallbackAuth] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectToDashboard = useCallback(() => {
    console.log("Redirecting to dashboard...");
    // より確実な遷移方法
    try {
      // まずrouter.pushを試行
      router.push('/dashboard');
      // フォールバックとしてwindow.location.hrefを使用
      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          console.log("Router push failed, using window.location.href");
          window.location.href = '/dashboard';
        }
      }, 1000);
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = '/dashboard';
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;

    // PKCEエラーをチェック
    const pkceError = searchParams.get('pkce_error');
    const authError = searchParams.get('error');
    
    if (pkceError === 'true' || (authError && authError.includes('code verifier'))) {
      console.log("PKCE error detected, switching to fallback auth");
      setUseFallbackAuth(true);
    }

    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Checking auth state:", { hasSession: !!session, user: session?.user?.email });
        
        if (session && mounted) {
          console.log("Session found, redirecting to dashboard");
          redirectToDashboard();
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session);
      if (mounted) {
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, redirecting to dashboard");
          redirectToDashboard();
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed");
        } else if (event === 'INITIAL_SESSION') {
          console.log("Initial session:", session);
          if (session) {
            console.log("Initial session found, redirecting to dashboard");
            redirectToDashboard();
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [redirectToDashboard, searchParams]);

  // フォールバック認証の実装
  const handleFallbackAuth = async () => {
    try {
      console.log("Starting fallback Google auth...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/dashboard`
            : '/dashboard'
        }
      });
      
      if (error) {
        console.error("Fallback auth error:", error);
      } else {
        console.log("Fallback auth initiated");
      }
    } catch (error) {
      console.error("Fallback auth exception:", error);
    }
  };

  // リダイレクトURLを動的に生成（改善版）
  const getRedirectUrl = () => {
    if (useFallbackAuth) {
      // フォールバック時は直接ダッシュボードに
      return typeof window !== 'undefined' 
        ? `${window.location.origin}/dashboard`
        : '/dashboard';
    }
    
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/auth/callback`;
      console.log("Redirect URL (client):", redirectUrl);
      console.log("Current environment:", {
        origin: currentOrigin,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
      });
      return redirectUrl;
    }
    
    // サーバーサイドでは環境変数を使用
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
    if (siteUrl) {
      let finalUrl = siteUrl;
      if (!siteUrl.startsWith('http')) {
        finalUrl = `https://${siteUrl}`;
      }
      const redirectUrl = `${finalUrl}/auth/callback`;
      console.log("Redirect URL (server):", redirectUrl);
      return redirectUrl;
    }
    
    // フォールバック
    console.log("Using fallback redirect URL: /auth/callback");
    return '/auth/callback';
  };

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
          <CardContent>
            {useFallbackAuth ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    認証に問題が発生しました。代替方法でログインを試行します。
                  </p>
                </div>
                <button
                  onClick={handleFallbackAuth}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Googleでログイン（代替方法）
                </button>
                <button
                  onClick={() => {
                    setUseFallbackAuth(false);
                    // URLパラメータをクリア
                    const url = new URL(window.location.href);
                    url.searchParams.delete('pkce_error');
                    url.searchParams.delete('error');
                    window.history.replaceState({}, '', url.toString());
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  通常の方法に戻る
                </button>
              </div>
            ) : (
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
                redirectTo={getRedirectUrl()}
                showLinks={false}
                view="sign_in"
                localization={{
                  variables: {
                    sign_in: {
                      email_label: "メールアドレス",
                      password_label: "パスワード",
                      button_label: "ログイン",
                      loading_button_label: "ログイン中...",
                      social_provider_text: "{{provider}}でログイン",
                      link_text: "既にアカウントをお持ちですか？ログイン"
                    }
                  }
                }}
              />
            )}
            
            {searchParams.get('error') && !useFallbackAuth && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">
                  認証エラー: {decodeURIComponent(searchParams.get('error') || '')}
                </p>
                <button
                  onClick={() => setUseFallbackAuth(true)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  代替方法を試す
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ページを読み込み中...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
