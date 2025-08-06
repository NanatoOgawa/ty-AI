import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // 開発環境ではCSPを無効化
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://*.supabase.com https://accounts.google.com https://oauth2.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://*.supabase.co https://*.supabase.com",
              "img-src 'self' data: https: https://*.supabase.co https://*.supabase.com",
              "connect-src 'self' https://*.supabase.co https://*.supabase.com https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com",
              "frame-src 'self' https://accounts.google.com https://*.supabase.co https://*.supabase.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.supabase.co https://*.supabase.com",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
