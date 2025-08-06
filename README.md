# リピートつながるAI

夜職（ホステス、キャバクラ、スナック、バー等）で働く方々のためのAIメッセージ生成アプリケーションです。お客様との関係を深めるための親しみやすく温かいメッセージを自動生成します。

## 機能

- 🤖 **AIメッセージ生成**: お客様情報を基にパーソナライズされたメッセージを生成
- 👥 **お客様管理**: お客様の基本情報、好み、重要メモなどを管理
- 📝 **メモ機能**: お客様に関するメモをカテゴリ別に管理
- 📊 **トーン分析**: メッセージのトーン分析と改善提案
- 📈 **使用履歴**: 生成したメッセージの履歴管理
- ⭐ **評価機能**: 生成されたメッセージの評価とフィードバック

## 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **AI**: Google Gemini API
- **UI**: shadcn/ui

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### 3. データベースのセットアップ

SupabaseのSQLエディタで`supabase-schema-unified.sql`を実行してください：

```sql
-- 完全統合データベーススキーマ
-- このファイルは、すべての機能を含む完全なデータベーススキーマです
-- 既存のDBに上書きする形で実行してください
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## データベース構造

### 主要テーブル

1. **`customers`** - お客様基本情報
   - 名前、会社名、メール、電話番号、関係性、好み、重要メモ、誕生日、記念日など

2. **`message_history`** - メッセージ履歴
   - 生成されたメッセージの履歴とメタデータ

3. **`customer_notes`** - お客様メモ
   - お客様に関するメモ（一般、好み、履歴、重要、リマインダー）

4. **`visits`** - 訪問履歴
   - お客様の訪問記録

5. **`user_tone_preferences`** - ユーザートーン設定
   - ユーザーのメッセージトーンに関する好みと使用状況

6. **`message_ratings`** - メッセージ評価
   - 生成されたメッセージの評価とフィードバック

### インデックスとパフォーマンス

- 各テーブルに適切なインデックスを設定
- RLS（Row Level Security）によるセキュリティ
- 自動更新トリガーによる`updated_at`管理

## 使用方法

### お客様管理

1. ダッシュボードから「お客様管理」をクリック
2. 「新規登録」でお客様情報を入力
3. 基本情報、好み、重要メモなどを登録

### メッセージ生成

1. 「新規メッセージ作成」またはお客様管理から「メッセージ作成」
2. お客様名、何があったか、メッセージ種類、トーンを選択
3. AIがお客様の基本情報を考慮してメッセージを生成

### メモ管理

1. 「お客様メモ管理」からメモを作成・管理
2. カテゴリ別にメモを整理
3. メッセージ生成時にメモを参照

## 開発

### ファイル構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # ダッシュボード関連ページ
│   └── auth/              # 認証関連ページ
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/uiコンポーネント
│   └── common/           # 共通コンポーネント
├── lib/                  # ユーティリティ関数
└── types/                # TypeScript型定義
```

### データベースファイル

- `supabase-schema-unified.sql` - 完全統合データベーススキーマ
- `db-archive/` - 古いDBファイル（アーカイブ）

## デプロイ

### Vercel

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. デプロイ

### その他のプラットフォーム

Next.jsの標準的なデプロイ方法に従ってください。

## ライセンス

This project is licensed under the MIT License.
