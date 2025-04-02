/*
  # Add subtitle column to carousel table

  1. Changes
    - Add subtitle column to carousel table
    - Ensure column is nullable
    
  2. Security
    - No security changes needed
*/

-- Add subtitle column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'carousel' 
    AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE carousel ADD COLUMN subtitle text;
  END IF;
END $$;