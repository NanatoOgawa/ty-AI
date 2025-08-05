-- 現在のDB構造に追加するテーブル

-- メッセージ履歴テーブル
CREATE TABLE message_history (
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

-- 既存のcustomersテーブルに列を追加（必要に応じて）
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS company TEXT;
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS relationship TEXT;
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- RLS (Row Level Security) の設定
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;

-- メッセージ履歴テーブルのポリシー
CREATE POLICY "Users can view their own message history" ON message_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message history" ON message_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message history" ON message_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message history" ON message_history
  FOR DELETE USING (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX idx_message_history_user_id ON message_history(user_id);
CREATE INDEX idx_message_history_customer_id ON message_history(customer_id);
CREATE INDEX idx_message_history_created_at ON message_history(created_at DESC); 