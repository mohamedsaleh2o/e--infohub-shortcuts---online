-- 🗄️ Supabase Database Setup for E& InfoHub
-- Run this SQL in your Supabase SQL Editor
-- This creates separate tables for better performance and organization

-- ============================
-- BUNDLES TABLE
-- ============================
CREATE TABLE bundles (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    keywords TEXT,
    link TEXT,
    price NUMERIC,
    data TEXT,
    minutes TEXT,
    roaming TEXT,
    commitment TEXT,
    category TEXT,
    source TEXT DEFAULT 'manual',
    cpr JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bundles_name ON bundles(name);
CREATE INDEX idx_bundles_category ON bundles(category);
CREATE INDEX idx_bundles_source ON bundles(source);

-- ============================
-- ADDONS TABLE
-- ============================
CREATE TABLE addons (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    keywords TEXT,
    link TEXT,
    cpr JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addons_name ON addons(name);

-- ============================
-- SLA TABLE (Service Level Agreements)
-- ============================
CREATE TABLE slas (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    keywords TEXT,
    time TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_slas_name ON slas(name);

-- ============================
-- NAVIGATORS TABLE (UI Navigation Paths)
-- ============================
CREATE TABLE navigators (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    keywords TEXT,
    path TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_navigators_name ON navigators(name);

-- ============================
-- SCENARIOS TABLE (Customer Service Scenarios)
-- ============================
CREATE TABLE scenarios (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    keywords TEXT,
    description TEXT,
    tag TEXT CHECK (tag IN ('inquiry', 'request', 'complaint')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenarios_title ON scenarios(title);
CREATE INDEX idx_scenarios_tag ON scenarios(tag);

-- ============================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigators ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- ============================
-- RLS POLICIES (Allow all for now - adjust for production)
-- ============================
-- BUNDLES policies
CREATE POLICY "Enable all operations for bundles" ON bundles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ADDONS policies
CREATE POLICY "Enable all operations for addons" ON addons
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- SLAS policies
CREATE POLICY "Enable all operations for slas" ON slas
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- NAVIGATORS policies
CREATE POLICY "Enable all operations for navigators" ON navigators
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- SCENARIOS policies
CREATE POLICY "Enable all operations for scenarios" ON scenarios
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: If you want to add authentication later, replace the above policy with:
-- CREATE POLICY "Enable read for everyone" ON shortcuts FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users" ON shortcuts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Enable update for authenticated users" ON shortcuts FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Enable delete for authenticated users" ON shortcuts FOR DELETE USING (auth.role() = 'authenticated');

-- ============================
-- AUTO-UPDATE TIMESTAMPS
-- ============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_bundles_updated_at 
    BEFORE UPDATE ON bundles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addons_updated_at 
    BEFORE UPDATE ON addons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slas_updated_at 
    BEFORE UPDATE ON slas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navigators_updated_at 
    BEFORE UPDATE ON navigators 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at 
    BEFORE UPDATE ON scenarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================
-- OPTIONAL: SAMPLE DATA
-- ============================
-- Uncomment to insert sample scenarios
/*
INSERT INTO scenarios (title, description, tag) VALUES
('Billing Dispute Resolution', 'Customer disputes recent charges.\nSLA: Resolve within 24 hours.\nNote: Check billing history, offer refund if valid.', 'complaint'),
('Plan Upgrade Request', 'Customer wants to upgrade to higher data plan.\nSLA: Process within 2 hours.\nNote: Check eligibility, explain new charges.', 'request'),
('Network Coverage Inquiry', 'Customer asking about 5G coverage in specific area.\nSLA: Respond within 1 hour.\nNote: Check coverage map, provide alternatives.', 'inquiry');
*/

COMMIT;
