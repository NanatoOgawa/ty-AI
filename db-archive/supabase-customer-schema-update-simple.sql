-- お客様管理機能のためのデータベーススキーマ更新（簡易版）

-- 新しい列を個別に追加（エラーが発生した場合は手動で確認）
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferences TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS important_notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS anniversary DATE;

-- updated_at列が存在しない場合は追加
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- updated_atを自動更新するためのトリガー関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーを作成（既に存在する場合は無視）
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成（既に存在する場合は無視）
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_preferences ON customers(preferences);
CREATE INDEX IF NOT EXISTS idx_customers_important_notes ON customers(important_notes);
CREATE INDEX IF NOT EXISTS idx_customers_birthday ON customers(birthday);
CREATE INDEX IF NOT EXISTS idx_customers_anniversary ON customers(anniversary);

-- 確認クエリ
SELECT 'customers table updated successfully' as status; 