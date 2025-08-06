-- ユーザー別トーン設定テーブル
CREATE TABLE IF NOT EXISTS user_tone_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tone_type VARCHAR(50) NOT NULL, -- professional, friendly, formal, casual
  preference_score FLOAT DEFAULT 0.5, -- 0.0-1.0のスコア
  usage_count INTEGER DEFAULT 0, -- 使用回数
  success_rate FLOAT DEFAULT 0.0, -- 成功率（評価から計算）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tone_type)
);

-- メッセージ評価テーブル
CREATE TABLE IF NOT EXISTS message_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES message_history(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5の評価
  tone_type VARCHAR(50) NOT NULL,
  feedback TEXT, -- ユーザーのフィードバック
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_user_tone_preferences_user_id ON user_tone_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tone_preferences_tone_type ON user_tone_preferences(tone_type);
CREATE INDEX IF NOT EXISTS idx_message_ratings_user_id ON message_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_ratings_message_id ON message_ratings(message_id);

-- RLSポリシーの設定
ALTER TABLE user_tone_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のトーン設定のみアクセス可能
CREATE POLICY "Users can view their own tone preferences" ON user_tone_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tone preferences" ON user_tone_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tone preferences" ON user_tone_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tone preferences" ON user_tone_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- ユーザーは自分のメッセージ評価のみアクセス可能
CREATE POLICY "Users can view their own message ratings" ON message_ratings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message ratings" ON message_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message ratings" ON message_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message ratings" ON message_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- 確認クエリ
SELECT 'user_tone_preferences and message_ratings tables created successfully' as status; 