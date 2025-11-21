-- ============================
-- MIGRATION: Add missing columns to bundles table
-- ============================
-- Run this in your Supabase SQL Editor to fix the PGRST204 error
-- This adds the fullData and unique_id columns that the app is trying to use

-- Add fullData column to store complete plan data
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS fullData JSONB;

-- Add unique_id column to prevent duplicates
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS unique_id TEXT UNIQUE;

-- Create index on unique_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bundles_unique_id ON bundles(unique_id);

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '   - Added fullData column (JSONB)';
    RAISE NOTICE '   - Added unique_id column (TEXT UNIQUE)';
    RAISE NOTICE '   - Created index on unique_id';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Please refresh your schema cache in the app now.';
END $$;

COMMIT;
