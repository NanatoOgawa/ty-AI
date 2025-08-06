-- =====================================================
-- ユーザー別トーン調整機能の実装
-- =====================================================

-- 1. ユーザー別トーン設定テーブル
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

-- 2. メッセージ評価テーブル
CREATE TABLE IF NOT EXISTS message_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES message_history(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5の評価
  tone_type VARCHAR(50) NOT NULL,
  feedback TEXT, -- ユーザーのフィードバック
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_user_tone_preferences_user_id ON user_tone_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tone_preferences_tone_type ON user_tone_preferences(tone_type);
CREATE INDEX IF NOT EXISTS idx_message_ratings_user_id ON message_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_ratings_message_id ON message_ratings(message_id);
CREATE INDEX IF NOT EXISTS idx_message_ratings_tone_type ON message_ratings(tone_type);

-- 4. RLS（Row Level Security）の有効化
ALTER TABLE user_tone_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;

-- 5. ユーザー別トーン設定のRLSポリシー
-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view their own tone preferences" ON user_tone_preferences;
DROP POLICY IF EXISTS "Users can insert their own tone preferences" ON user_tone_preferences;
DROP POLICY IF EXISTS "Users can update their own tone preferences" ON user_tone_preferences;
DROP POLICY IF EXISTS "Users can delete their own tone preferences" ON user_tone_preferences;

-- 新しいポリシーを作成
CREATE POLICY "Users can view their own tone preferences" ON user_tone_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tone preferences" ON user_tone_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tone preferences" ON user_tone_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tone preferences" ON user_tone_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- 6. メッセージ評価のRLSポリシー
-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view their own message ratings" ON message_ratings;
DROP POLICY IF EXISTS "Users can insert their own message ratings" ON message_ratings;
DROP POLICY IF EXISTS "Users can update their own message ratings" ON message_ratings;
DROP POLICY IF EXISTS "Users can delete their own message ratings" ON message_ratings;

-- 新しいポリシーを作成
CREATE POLICY "Users can view their own message ratings" ON message_ratings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message ratings" ON message_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message ratings" ON message_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message ratings" ON message_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- 7. トーン分析用のビュー作成
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

-- 8. トーン分析用の関数作成
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
    uta.tone_type,
    uta.preference_score,
    uta.usage_count,
    uta.success_rate,
    uta.recommendation,
    uta.total_ratings,
    uta.average_rating
  FROM user_tone_analysis uta
  WHERE uta.user_id = user_uuid
  ORDER BY uta.tone_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. トーン使用回数更新用の関数作成
CREATE OR REPLACE FUNCTION update_tone_usage_count(user_uuid UUID, tone_type_param VARCHAR(50))
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_tone_preferences (user_id, tone_type, usage_count, updated_at)
  VALUES (user_uuid, tone_type_param, 1, NOW())
  ON CONFLICT (user_id, tone_type)
  DO UPDATE SET 
    usage_count = user_tone_preferences.usage_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 成功率計算用の関数作成
CREATE OR REPLACE FUNCTION calculate_tone_success_rate(user_uuid UUID, tone_type_param VARCHAR(50))
RETURNS FLOAT AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM message_ratings
  WHERE user_id = user_uuid AND tone_type = tone_type_param;
  
  IF avg_rating IS NULL THEN
    RETURN 0.0;
  ELSE
    RETURN (avg_rating / 5.0)::FLOAT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 確認クエリ
SELECT 'Tone analysis tables and functions created successfully' as status;

-- 12. テーブル構造の確認
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_tone_preferences', 'message_ratings')
ORDER BY table_name, ordinal_position; 