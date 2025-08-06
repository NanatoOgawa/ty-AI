-- customer_notesテーブルの存在確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'customer_notes'
) as table_exists;

-- customer_notesテーブルの構造確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'customer_notes'
ORDER BY ordinal_position;

-- テーブルが存在しない場合は作成
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'customer_notes'
  ) THEN
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

    -- ユーザーは自分のメモのみアクセス可能
    CREATE POLICY "Users can view their own customer notes" ON customer_notes
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own customer notes" ON customer_notes
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own customer notes" ON customer_notes
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own customer notes" ON customer_notes
      FOR DELETE USING (auth.uid() = user_id);

    RAISE NOTICE 'customer_notes table created successfully';
  ELSE
    RAISE NOTICE 'customer_notes table already exists';
  END IF;
END $$; 