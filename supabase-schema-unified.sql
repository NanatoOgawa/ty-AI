-- =====================================================
-- 完全統合データベーススキーマ
-- =====================================================
-- このファイルは、すべての機能を含む完全なデータベーススキーマです
-- 既存のDBに上書きする形で実行してください

-- =====================================================
-- 1. 既存のテーブルを削除（依存関係を考慮して順序を調整）
-- =====================================================
DROP TABLE IF EXISTS message_ratings CASCADE;
DROP TABLE IF EXISTS user_tone_preferences CASCADE;
DROP TABLE IF EXISTS customer_notes CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS message_history CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- トリガー関数を削除（存在する場合）
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_user_tone_analysis(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_tone_usage_count(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS calculate_tone_success_rate(UUID, VARCHAR) CASCADE;

-- ビューを削除（存在する場合）
DROP VIEW IF EXISTS user_tone_analysis CASCADE;

-- =====================================================
-- 2. テーブルの作成
-- =====================================================

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tone_type)
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

-- =====================================================
-- 3. トリガー関数とトリガーの作成
-- =====================================================

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

-- =====================================================
-- 4. RLS (Row Level Security) の設定
-- =====================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tone_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. ポリシーの作成
-- =====================================================

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

-- =====================================================
-- 6. インデックスの作成
-- =====================================================

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

-- =====================================================
-- 7. トーン分析用の関数とビュー
-- =====================================================

-- ユーザーのトーン分析を取得する関数
CREATE OR REPLACE FUNCTION get_user_tone_analysis(user_uuid UUID)
RETURNS TABLE (
  tone_type VARCHAR(50),
  preference_score FLOAT,
  usage_count INTEGER,
  success_rate FLOAT,
  recommendation TEXT,
  total_ratings BIGINT,
  average_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    utp.tone_type,
    COALESCE(utp.preference_score, 0.5) as preference_score,
    COALESCE(utp.usage_count, 0) as usage_count,
    COALESCE(utp.success_rate, 0.0) as success_rate,
    CASE 
      WHEN COALESCE(utp.success_rate, 0.0) >= 0.8 THEN '推奨'
      WHEN COALESCE(utp.success_rate, 0.0) >= 0.6 THEN '要調整'
      ELSE '改善が必要'
    END as recommendation,
    COUNT(mr.id) as total_ratings,
    AVG(mr.rating) as average_rating
  FROM (VALUES ('professional'), ('friendly'), ('formal'), ('casual')) as tones(tone_type)
  LEFT JOIN user_tone_preferences utp ON utp.user_id = user_uuid AND utp.tone_type = tones.tone_type
  LEFT JOIN message_ratings mr ON mr.user_id = user_uuid AND mr.tone_type = tones.tone_type
  GROUP BY utp.tone_type, utp.preference_score, utp.usage_count, utp.success_rate;
END;
$$ LANGUAGE plpgsql;

-- トーン使用回数を更新する関数
CREATE OR REPLACE FUNCTION update_tone_usage_count(user_uuid UUID, tone_type_param VARCHAR(50))
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_tone_preferences (user_id, tone_type, usage_count)
  VALUES (user_uuid, tone_type_param, 1)
  ON CONFLICT (user_id, tone_type)
  DO UPDATE SET 
    usage_count = user_tone_preferences.usage_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- トーン成功率を計算する関数
CREATE OR REPLACE FUNCTION calculate_tone_success_rate(user_uuid UUID, tone_type_param VARCHAR(50))
RETURNS VOID AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM message_ratings
  WHERE user_id = user_uuid AND tone_type = tone_type_param;
  
  IF avg_rating IS NOT NULL THEN
    UPDATE user_tone_preferences
    SET success_rate = (avg_rating - 1) / 4.0, -- 1-5の評価を0-1のスコアに変換
        updated_at = NOW()
    WHERE user_id = user_uuid AND tone_type = tone_type_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- トーン分析用のビュー作成
CREATE OR REPLACE VIEW user_tone_analysis AS
SELECT 
  u.id as user_id,
  u.email,
  utp.tone_type,
  COALESCE(utp.preference_score, 0.5) as preference_score,
  COALESCE(utp.usage_count, 0) as usage_count,
  COALESCE(utp.success_rate, 0.0) as success_rate,
  CASE 
    WHEN COALESCE(utp.success_rate, 0.0) >= 0.8 THEN '推奨'
    WHEN COALESCE(utp.success_rate, 0.0) >= 0.6 THEN '要調整'
    ELSE '改善が必要'
  END as recommendation,
  COUNT(mr.id) as total_ratings,
  AVG(mr.rating) as average_rating
FROM auth.users u
CROSS JOIN (VALUES ('professional'), ('friendly'), ('formal'), ('casual')) as tones(tone_type)
LEFT JOIN user_tone_preferences utp ON u.id = utp.user_id AND utp.tone_type = tones.tone_type
LEFT JOIN message_ratings mr ON u.id = mr.user_id AND mr.tone_type = tones.tone_type
GROUP BY u.id, u.email, utp.tone_type, utp.preference_score, utp.usage_count, utp.success_rate;

-- =====================================================
-- 8. 確認クエリ
-- =====================================================
SELECT 'All tables, functions, and views created successfully' as status; 