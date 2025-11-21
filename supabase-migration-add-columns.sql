-- ============================
-- MIGRATION: Add missing columns to bundles table
-- ============================
-- Run this in your Supabase SQL Editor to fix the PGRST204 error
-- URL: https://supabase.com/dashboard/project/ywsbhmpzmtqovgtltsfw/sql/new

-- Step 1: Add fullData column to store complete plan data
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS fullData JSONB;

-- Step 2: Add unique_id column to prevent duplicates
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS unique_id TEXT;

-- Step 3: Add unique constraint (dropping first if exists to avoid error)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'bundles_unique_id_key'
    ) THEN
        ALTER TABLE bundles ADD CONSTRAINT bundles_unique_id_key UNIQUE (unique_id);
    END IF;
END $$;

-- Step 4: Create index on unique_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bundles_unique_id ON bundles(unique_id);

-- Step 5: Verify the columns were added
DO $$
DECLARE
    fulldata_exists boolean;
    unique_id_exists boolean;
BEGIN
    -- Check if fullData column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bundles' AND column_name = 'fulldata'
    ) INTO fulldata_exists;
    
    -- Check if unique_id column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bundles' AND column_name = 'unique_id'
    ) INTO unique_id_exists;
    
    -- Display results
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Column Status:';
    RAISE NOTICE '  - fullData column: %', CASE WHEN fulldata_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE '  - unique_id column: %', CASE WHEN unique_id_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE '';
    RAISE NOTICE '� Next Steps:';
    RAISE NOTICE '  1. Refresh your browser (Ctrl+F5)';
    RAISE NOTICE '  2. Check the console for success messages';
    RAISE NOTICE '  3. Try loading bundles again';
    RAISE NOTICE '========================================';
END $$;
