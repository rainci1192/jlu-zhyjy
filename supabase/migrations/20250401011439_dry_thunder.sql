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