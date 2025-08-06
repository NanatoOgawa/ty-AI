-- データ保持型マイグレーション（既存データを保持してスキーマを更新）
-- このファイルは既存のデータを保持したまま、新しい列とテーブルを追加します
-- 画像のDB構造に基づいて作成

-- 1. 既存のテーブルに新しい列を追加（データを保持）
DO $$ 
BEGIN
    -- customersテーブルに新しい列を追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'phone') THEN
        ALTER TABLE customers ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'preferences') THEN
        ALTER TABLE customers ADD COLUMN preferences TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'important_notes') THEN
        ALTER TABLE customers ADD COLUMN important_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'birthday') THEN
        ALTER TABLE customers ADD COLUMN birthday DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'anniversary') THEN
        ALTER TABLE customers ADD COLUMN anniversary DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
        ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'company') THEN
        ALTER TABLE customers ADD COLUMN company TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'email') THEN
        ALTER TABLE customers ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'relationship') THEN
        ALTER TABLE customers ADD COLUMN relationship TEXT;
    END IF;
END $$;

-- 2. customer_notesテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  note_content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. visitsテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  topics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. user_tone_preferencesテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS user_tone_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tone_type VARCHAR(50) NOT NULL,
  preference_score FLOAT DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. message_ratingsテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS message_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tone_type VARCHAR(50),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. updated_atを自動更新するためのトリガー関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. トリガーを作成（既に存在する場合は無視）
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_notes_updated_at ON customer_notes;
CREATE TRIGGER update_customer_notes_updated_at
    BEFORE UPDATE ON customer_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_tone_preferences_updated_at ON user_tone_preferences;
CREATE TRIGGER update_user_tone_preferences_updated_at
    BEFORE UPDATE ON user_tone_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS (Row Level Security) の設定
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tone_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;

-- 9. ポリシーの作成（既に存在する場合は無視）
-- customersテーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
CREATE POLICY "Users can view their own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
CREATE POLICY "Users can insert their own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
CREATE POLICY "Users can update their own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
CREATE POLICY "Users can delete their own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- message_historyテーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own message history" ON message_history;
CREATE POLICY "Users can view their own message history" ON message_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own message history" ON message_history;
CREATE POLICY "Users can insert their own message history" ON message_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own message history" ON message_history;
CREATE POLICY "Users can update their own message history" ON message_history
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own message history" ON message_history;
CREATE POLICY "Users can delete their own message history" ON message_history
  FOR DELETE USING (auth.uid() = user_id);

-- customer_notesテーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own customer notes" ON customer_notes;
CREATE POLICY "Users can view their own customer notes" ON customer_notes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own customer notes" ON customer_notes;
CREATE POLICY "Users can insert their own customer notes" ON customer_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own customer notes" ON customer_notes;
CREATE POLICY "Users can update their own customer notes" ON customer_notes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own customer notes" ON customer_notes;
CREATE POLICY "Users can delete their own customer notes" ON customer_notes
  FOR DELETE USING (auth.uid() = user_id);

-- visitsテーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own visits" ON visits;
CREATE POLICY "Users can view their own visits" ON visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = visits.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own visits" ON visits;
CREATE POLICY "Users can insert their own visits" ON visits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = visits.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own visits" ON visits;
CREATE POLICY "Users can update their own visits" ON visits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = visits.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own visits" ON visits;
CREATE POLICY "Users can delete their own visits" ON visits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = visits.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

-- user_tone_preferencesテーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own tone preferences" ON user_tone_preferences;
CREATE POLICY "Users can view their own tone preferences" ON user_tone_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tone preferences" ON user_tone_preferences;
CREATE POLICY "Users can insert their own tone preferences" ON user_tone_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tone preferences" ON user_tone_preferences;
CREATE POLICY "Users can update their own tone preferences" ON user_tone_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tone preferences" ON user_tone_preferences;
CREATE POLICY "Users can delete their own tone preferences" ON user_tone_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- message_ratingsテーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own message ratings" ON message_ratings;
CREATE POLICY "Users can view their own message ratings" ON message_ratings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own message ratings" ON message_ratings;
CREATE POLICY "Users can insert their own message ratings" ON message_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own message ratings" ON message_ratings;
CREATE POLICY "Users can update their own message ratings" ON message_ratings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own message ratings" ON message_ratings;
CREATE POLICY "Users can delete their own message ratings" ON message_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- 10. インデックスの作成（既に存在する場合は無視）
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_preferences ON customers(preferences);
CREATE INDEX IF NOT EXISTS idx_customers_important_notes ON customers(important_notes);
CREATE INDEX IF NOT EXISTS idx_customers_birthday ON customers(birthday);
CREATE INDEX IF NOT EXISTS idx_customers_anniversary ON customers(anniversary);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
CREATE INDEX IF NOT EXISTS idx_customers_relationship ON customers(relationship);

CREATE INDEX IF NOT EXISTS idx_customer_notes_user_id ON customer_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON customer_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_notes_note_type ON customer_notes(note_type);

CREATE INDEX IF NOT EXISTS idx_visits_customer_id ON visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);

CREATE INDEX IF NOT EXISTS idx_user_tone_preferences_user_id ON user_tone_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tone_preferences_tone_type ON user_tone_preferences(tone_type);

CREATE INDEX IF NOT EXISTS idx_message_ratings_user_id ON message_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_ratings_message_id ON message_ratings(message_id);
CREATE INDEX IF NOT EXISTS idx_message_ratings_rating ON message_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_message_ratings_tone_type ON message_ratings(tone_type);

-- 11. 確認クエリ
SELECT 'Migration completed successfully' as status; 