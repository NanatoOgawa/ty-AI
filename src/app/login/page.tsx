"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session);
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, redirecting to dashboard");
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // リダイレクトURLを動的に生成
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      // クライアントサイドでは現在のURLをベースにする
      const protocol = window.location.protocol;
      const host = window.location.host;
      const redirectUrl = `${protocol}//${host}/dashboard`;
      console.log("Redirect URL:", redirectUrl);
      return redirectUrl;
    }
    // サーバーサイドでは環境変数またはデフォルト値を使用
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
    if (siteUrl) {
      const protocol = siteUrl.startsWith('https') ? 'https' : 'http';
      return `${protocol}://${siteUrl}/dashboard`;
    }
    return '/dashboard';
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
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
