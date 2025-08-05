-- メッセージ履歴テーブルを作成（既に存在する場合はスキップ）
CREATE TABLE IF NOT EXISTS message_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  message_type TEXT NOT NULL,
  tone TEXT NOT NULL,
  generated_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view their own message history" ON message_history;
DROP POLICY IF EXISTS "Users can insert their own message history" ON message_history;
DROP POLICY IF EXISTS "Users can update their own message history" ON message_history;
DROP POLICY IF EXISTS "Users can delete their own message history" ON message_history;

-- メッセージ履歴テーブルのポリシーを作成
CREATE POLICY "Users can view their own message history" ON message_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message history" ON message_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message history" ON message_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message history" ON message_history
  FOR DELETE USING (auth.uid() = user_id);

-- 既存のインデックスを削除（存在する場合）
DROP INDEX IF EXISTS idx_message_history_user_id;
DROP INDEX IF EXISTS idx_message_history_customer_id;
DROP INDEX IF EXISTS idx_message_history_created_at;

-- パフォーマンス向上のためのインデックスを作成
CREATE INDEX idx_message_history_user_id ON message_history(user_id);
CREATE INDEX idx_message_history_customer_id ON message_history(customer_id);
CREATE INDEX idx_message_history_created_at ON message_history(created_at DESC);

-- 確認用のクエリ
SELECT 
  'message_history table created successfully' as status,
  COUNT(*) as row_count
FROM message_history; 