import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 環境変数の確認
  if (!supabaseUrl) {
    throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  console.log('Supabase server client initialization:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  });

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// APIルート用のクライアント作成関数
export async function createApiClient(cookieHeader: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      cookies: {
        getAll() {
          if (!cookieHeader) return [];
          
          console.log('Parsing cookies from header:', cookieHeader.substring(0, 100) + '...');
          
          const cookies = cookieHeader.split(';').map(cookie => {
            const trimmedCookie = cookie.trim();
            const equalIndex = trimmedCookie.indexOf('=');
            if (equalIndex === -1) return null;
            
            const name = trimmedCookie.substring(0, equalIndex);
            const value = trimmedCookie.substring(equalIndex + 1);
            
            console.log('Parsed cookie:', { name, value: value.substring(0, 20) + '...' });
            return { name, value };
          }).filter((cookie): cookie is { name: string; value: string } => cookie !== null);
          
          return cookies;
        },
        setAll() {
          // APIルートではクッキーの設定は不要
        },
      },
    }
  );
}
