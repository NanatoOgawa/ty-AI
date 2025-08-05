-- 現在のテーブル一覧を確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- message_historyテーブルの存在確認
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'message_history'
    ) THEN 'message_history table exists'
    ELSE 'message_history table does not exist'
  END as table_status;

-- message_historyテーブルの構造確認（存在する場合）
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'message_history'
ORDER BY ordinal_position;

-- 既存のポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'message_history';

-- 既存のインデックスを確認
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'message_history'; 