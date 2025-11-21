-- Supabase Database Setup for Link Shortcuts Hub
-- Run this SQL in your Supabase SQL Editor

-- Create the shortcuts table
CREATE TABLE shortcuts (
    id BIGINT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('bundle', 'addon', 'devicec', 'sla', 'navigator')),
    name TEXT NOT NULL,
    keywords TEXT,
    link TEXT,
    time TEXT,
    path TEXT,
    cpr JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_shortcuts_type ON shortcuts(type);
CREATE INDEX idx_shortcuts_name ON shortcuts(name);

-- Enable Row Level Security
ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for public access)
-- WARNING: This allows anyone to read/write. Adjust based on your security needs.
CREATE POLICY "Enable all operations for everyone" ON shortcuts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: If you want to add authentication later, replace the above policy with:
-- CREATE POLICY "Enable read for everyone" ON shortcuts FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users" ON shortcuts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Enable update for authenticated users" ON shortcuts FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Enable delete for authenticated users" ON shortcuts FOR DELETE USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on row update
CREATE TRIGGER update_shortcuts_updated_at 
    BEFORE UPDATE ON shortcuts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Insert sample data (uncomment if you want to start with examples)
/*
INSERT INTO shortcuts (id, type, name, keywords, link, cpr) VALUES
(1730000001, 'bundle', 'Freedom Plans', 'postpaid, freedom, unlimited, 5G', 'https://www.etisalat.ae/b2c/plans/postpaid', 
 '{"duration": "30 days", "fees": "AED 199/month", "discounts": "20% discount for first 3 months", "allowance": "Unlimited local calls, 100GB data, 500 international minutes", "restrictions": "Fair usage policy applies, 5G only in covered areas", "exitCharge": "AED 100 early termination fee"}'::jsonb);
*/

-- Grant necessary permissions (if using service role)
-- GRANT ALL ON shortcuts TO authenticated;
-- GRANT ALL ON shortcuts TO anon;

COMMIT;
