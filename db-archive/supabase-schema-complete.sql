-- 完全なデータベーススキーマ（既存DB上書き用）
-- このファイルを実行すると、既存のテーブルを削除して新しく作成します
-- 画像のDB構造に基づいて作成

-- 既存のテーブルを削除（依存関係を考慮して順序を調整）
DROP TABLE IF EXISTS message_ratings CASCADE;
DROP TABLE IF EXISTS user_tone_preferences CASCADE;
DROP TABLE IF EXISTS customer_notes CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS message_history CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- トリガー関数を削除（存在する場合）
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- お客様テーブル（完全版）
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  relationship TEXT,
  preferences TEXT,
  important_notes TEXT,
  birthday DATE,
  anniversary DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- お客様メモテーブル
CREATE TABLE customer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  note_content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general', -- general, preference, history, important, reminder
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 訪問履歴テーブル
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  topics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザートーン設定テーブル
CREATE TABLE user_tone_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tone_type VARCHAR(50) NOT NULL,
  preference_score FLOAT DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メッセージ評価テーブル
CREATE TABLE message_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tone_type VARCHAR(50),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_atを自動更新するためのトリガー関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーを作成
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_notes_updated_at
    BEFORE UPDATE ON customer_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tone_preferences_updated_at
    BEFORE UPDATE ON user_tone_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) の設定
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tone_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;

-- お客様テーブルのポリシー
CREATE POLICY "Users can view their own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- メッセージ履歴テーブルのポリシー
CREATE POLICY "Users can view their own message history" ON message_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message history" ON message_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message history" ON message_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message history" ON message_history
  FOR DELETE USING (auth.uid() = user_id);

-- お客様メモテーブルのポリシー
CREATE POLICY "Users can view their own customer notes" ON customer_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer notes" ON customer_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer notes" ON customer_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer notes" ON customer_notes
  FOR DELETE USING (auth.uid() = user_id);

-- 訪問履歴テーブルのポリシー
CREATE POLICY "Users can view their own visits" ON visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = visits.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own visits" ON visits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = visits.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own visits" ON visits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = visits.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own visits" ON visits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = visits.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

-- ユーザートーン設定テーブルのポリシー
CREATE POLICY "Users can view their own tone preferences" ON user_tone_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tone preferences" ON user_tone_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tone preferences" ON user_tone_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tone preferences" ON user_tone_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- メッセージ評価テーブルのポリシー
CREATE POLICY "Users can view their own message ratings" ON message_ratings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message ratings" ON message_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message ratings" ON message_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message ratings" ON message_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- インデックスの作成
-- customersテーブルのインデックス
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_company ON customers(company);
CREATE INDEX idx_customers_relationship ON customers(relationship);
CREATE INDEX idx_customers_birthday ON customers(birthday);
CREATE INDEX idx_customers_anniversary ON customers(anniversary);

-- message_historyテーブルのインデックス
CREATE INDEX idx_message_history_user_id ON message_history(user_id);
CREATE INDEX idx_message_history_customer_id ON message_history(customer_id);
CREATE INDEX idx_message_history_created_at ON message_history(created_at DESC);

-- customer_notesテーブルのインデックス
CREATE INDEX idx_customer_notes_user_id ON customer_notes(user_id);
CREATE INDEX idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX idx_customer_notes_created_at ON customer_notes(created_at);
CREATE INDEX idx_customer_notes_note_type ON customer_notes(note_type);

-- visitsテーブルのインデックス
CREATE INDEX idx_visits_customer_id ON visits(customer_id);
CREATE INDEX idx_visits_visit_date ON visits(visit_date);
CREATE INDEX idx_visits_created_at ON visits(created_at);

-- user_tone_preferencesテーブルのインデックス
CREATE INDEX idx_user_tone_preferences_user_id ON user_tone_preferences(user_id);
CREATE INDEX idx_user_tone_preferences_tone_type ON user_tone_preferences(tone_type);

-- message_ratingsテーブルのインデックス
CREATE INDEX idx_message_ratings_user_id ON message_ratings(user_id);
CREATE INDEX idx_message_ratings_message_id ON message_ratings(message_id);
CREATE INDEX idx_message_ratings_rating ON message_ratings(rating);
CREATE INDEX idx_message_ratings_tone_type ON message_ratings(tone_type);

-- 確認クエリ
SELECT 'All tables created successfully' as status; 