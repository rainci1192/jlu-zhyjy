/*
  # Add is_top field to admissions table

  1. Changes
    - Add is_top boolean column to admissions table
    - Set default value to false
    - Update existing rows
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add is_top column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'admissions' 
    AND column_name = 'is_top'
  ) THEN
    ALTER TABLE admissions ADD COLUMN is_top boolean DEFAULT false;
  END IF;
END $$;