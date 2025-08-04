"use client";

import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    setRedirectUrl(`${window.location.origin}/dashboard`);
  }, []);

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
            {redirectUrl && (
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
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
