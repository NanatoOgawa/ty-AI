-- お客様管理機能のためのデータベーススキーマ更新

-- 既存の列の存在を確認してから新しい列を追加
DO $$ 
BEGIN
    -- phone列の追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'phone') THEN
        ALTER TABLE customers ADD COLUMN phone TEXT;
    END IF;
    
    -- preferences列の追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'preferences') THEN
        ALTER TABLE customers ADD COLUMN preferences TEXT;
    END IF;
    
    -- important_notes列の追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'important_notes') THEN
        ALTER TABLE customers ADD COLUMN important_notes TEXT;
    END IF;
    
    -- birthday列の追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'birthday') THEN
        ALTER TABLE customers ADD COLUMN birthday DATE;
    END IF;
    
    -- anniversary列の追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'anniversary') THEN
        ALTER TABLE customers ADD COLUMN anniversary DATE;
    END IF;
    
    -- updated_at列の追加（既に存在する場合はスキップ）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
        ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

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
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
CREATE INDEX IF NOT EXISTS idx_customers_relationship ON customers(relationship);
CREATE INDEX IF NOT EXISTS idx_customers_birthday ON customers(birthday);
CREATE INDEX IF NOT EXISTS idx_customers_anniversary ON customers(anniversary);

-- 確認クエリ
SELECT 'customers table updated successfully' as status; 