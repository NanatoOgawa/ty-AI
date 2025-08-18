# 本番環境認証設定チェックリスト

## 🔍 現在の問題
- 開発環境: ✅ 正常動作
- 本番環境: ❌ ログイン後にエラーでlogin画面に戻る

## 📋 設定確認手順

### 1. 本番URL確認
まず、本番環境のURLを確認してください：
- **本番URL**: `https://your-app.vercel.app` (実際のURL)

### 2. Google Cloud Console設定 ⚙️

#### 承認済みJavaScriptの生成元
以下のURLを追加してください：
```
https://your-app.vercel.app
http://localhost:3000
```

#### 承認済みのリダイレクトURI
以下のURLを追加してください：
```
https://yeolplprhcjfooilworw.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

### 3. Supabase設定 🔐

#### Site URL
```
https://your-app.vercel.app
```

#### Redirect URLs
```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/dashboard
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
```

### 4. 環境変数確認 🔧

#### Vercelの環境変数
- `NEXT_PUBLIC_SUPABASE_URL`: `https://yeolplprhcjfooilworw.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[YOUR_ANON_KEY]`
- `GOOGLE_GEMINI_API_KEY`: `[YOUR_API_KEY]`

## 🧪 デバッグ手順

### 1. デバッグページにアクセス
本番環境で以下にアクセス：
```
https://your-app.vercel.app/debug
```

### 2. ログを確認
Vercelのダッシュボードでログを確認：
1. Vercel Dashboard → プロジェクト → Functions
2. エラーログを確認

### 3. ブラウザコンソール確認
1. F12でデベロッパーツールを開く
2. Consoleタブでエラーを確認
3. Networkタブで失敗したリクエストを確認

## 🚨 よくある問題と解決策

### 問題1: リダイレクトURI不一致
**症状**: `redirect_uri_mismatch` エラー
**解決**: Google Cloud ConsoleでリダイレクトURIを正確に設定

### 問題2: CORS エラー
**症状**: `Access-Control-Allow-Origin` エラー
**解決**: SupabaseでSite URLを正確に設定

### 問題3: 環境変数未設定
**症状**: `Missing environment variable` エラー
**解決**: Vercelで環境変数を設定し、デプロイし直す

### 問題4: PKCEエラー
**症状**: `code verifier` エラー
**解決**: ブラウザキャッシュをクリアして再試行

## 📞 トラブルシューティング

1. **キャッシュクリア**: ブラウザのキャッシュとCookieをクリア
2. **シークレットモード**: シークレット/プライベートモードでテスト
3. **異なるブラウザ**: Chrome、Safari、Firefoxで確認
4. **ネットワーク確認**: 異なるネットワーク（WiFi、モバイル）でテスト
