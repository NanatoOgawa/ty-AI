-- customer_notesテーブルを確実に作成するSQL

-- 既存のテーブルを削除（存在する場合）
DROP TABLE IF EXISTS customer_notes CASCADE;

-- お客さんのメモテーブルを作成
CREATE TABLE customer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  note_content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_customer_notes_user_id ON customer_notes(user_id);
CREATE INDEX idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX idx_customer_notes_created_at ON customer_notes(created_at);

-- RLSポリシーの設定
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view their own customer notes" ON customer_notes;
DROP POLICY IF EXISTS "Users can insert their own customer notes" ON customer_notes;
DROP POLICY IF EXISTS "Users can update their own customer notes" ON customer_notes;
DROP POLICY IF EXISTS "Users can delete their own customer notes" ON customer_notes;

-- 新しいポリシーを作成
CREATE POLICY "Users can view their own customer notes" ON customer_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer notes" ON customer_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer notes" ON customer_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer notes" ON customer_notes
  FOR DELETE USING (auth.uid() = user_id);

-- テーブル構造の確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'customer_notes'
ORDER BY ordinal_position;

-- 成功メッセージ
SELECT 'customer_notes table created successfully' as status; 