-- ============================
-- MIGRATION: Convert to NoSQL Schema
-- ============================
-- This converts all tables to flexible JSON storage (NoSQL style)
-- Run this at: https://supabase.com/dashboard/project/ywsbhmpzmtqovgtltsfw/sql/new

-- ============================
-- STEP 1: Backup existing data (optional)
-- ============================
-- If you want to keep existing data, export it first from Supabase UI

-- ============================
-- STEP 2: Drop old tables
-- ============================
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS addons CASCADE;
DROP TABLE IF EXISTS slas CASCADE;
DROP TABLE IF EXISTS navigators CASCADE;
DROP TABLE IF EXISTS scenarios CASCADE;

-- ============================
-- STEP 3: Create new NoSQL-style tables
-- ============================

-- BUNDLES TABLE (NoSQL)
CREATE TABLE bundles (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bundles_data ON bundles USING GIN (data);
CREATE INDEX idx_bundles_name ON bundles ((data->>'name'));
CREATE INDEX idx_bundles_source ON bundles ((data->>'source'));
CREATE INDEX idx_bundles_unique_id ON bundles ((data->>'unique_id'));

-- ADDONS TABLE (NoSQL)
CREATE TABLE addons (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addons_data ON addons USING GIN (data);
CREATE INDEX idx_addons_name ON addons ((data->>'name'));

-- SLAS TABLE (NoSQL)
CREATE TABLE slas (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_slas_data ON slas USING GIN (data);
CREATE INDEX idx_slas_name ON slas ((data->>'name'));

-- NAVIGATORS TABLE (NoSQL)
CREATE TABLE navigators (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_navigators_data ON navigators USING GIN (data);
CREATE INDEX idx_navigators_name ON navigators ((data->>'name'));

-- SCENARIOS TABLE (NoSQL)
CREATE TABLE scenarios (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenarios_data ON scenarios USING GIN (data);
CREATE INDEX idx_scenarios_title ON scenarios ((data->>'title'));
CREATE INDEX idx_scenarios_tag ON scenarios ((data->>'tag'));

-- ============================
-- STEP 4: Enable RLS
-- ============================
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigators ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- ============================
-- STEP 5: Create RLS Policies
-- ============================
CREATE POLICY "Enable all for bundles" ON bundles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for addons" ON addons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for slas" ON slas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for navigators" ON navigators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for scenarios" ON scenarios FOR ALL USING (true) WITH CHECK (true);

-- ============================
-- STEP 6: Create update triggers
-- ============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bundles_updated_at BEFORE UPDATE ON bundles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slas_updated_at BEFORE UPDATE ON slas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_navigators_updated_at BEFORE UPDATE ON navigators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================
-- SUCCESS MESSAGE
-- ============================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ NoSQL MIGRATION COMPLETED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tables now use flexible JSON schema';
    RAISE NOTICE 'You can store ANY fields without schema changes';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  ✓ bundles (NoSQL)';
    RAISE NOTICE '  ✓ addons (NoSQL)';
    RAISE NOTICE '  ✓ slas (NoSQL)';
    RAISE NOTICE '  ✓ navigators (NoSQL)';
    RAISE NOTICE '  ✓ scenarios (NoSQL)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Refresh your app (Ctrl+F5)';
    RAISE NOTICE '========================================';
END $$;
