/*
  # Add show_title field to carousel table

  1. Changes
    - Add show_title column to carousel table
    - Set default value to true for backward compatibility
    
  2. Security
    - No security changes needed
*/

-- Add show_title column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'carousel' 
    AND column_name = 'show_title'
  ) THEN
    ALTER TABLE carousel ADD COLUMN show_title boolean DEFAULT true;
  END IF;
END $$;