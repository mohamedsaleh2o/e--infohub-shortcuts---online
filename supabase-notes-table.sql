-- =====================================================
-- NOTES TABLE FOR E& INFOHUB
-- =====================================================
-- This table stores personal notes as a standalone section
-- Notes are synced with Supabase for persistence across devices

-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated and anonymous users
-- Adjust this based on your security requirements
CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update the updated_at column
DROP TRIGGER IF EXISTS notes_updated_at_trigger ON notes;
CREATE TRIGGER notes_updated_at_trigger
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================
-- Insert a note:
-- INSERT INTO notes (title, content) VALUES ('My Note Title', 'Note content here...');
--
-- Update a note:
-- UPDATE notes SET title = 'Updated Title', content = 'Updated content' WHERE id = 1;
--
-- Delete a note:
-- DELETE FROM notes WHERE id = 1;
--
-- Get all notes (newest first):
-- SELECT * FROM notes ORDER BY updated_at DESC;
