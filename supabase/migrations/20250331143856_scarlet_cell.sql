/*
  # Fix carousel table policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new policies with proper role checks
    
  2. Security
    - Allow admins full access
    - Allow public read access to active items
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin full access" ON carousel;
DROP POLICY IF EXISTS "Public read active" ON carousel;

-- Create carousel table if it doesn't exist
CREATE TABLE IF NOT EXISTS carousel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image text NOT NULL,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE carousel ENABLE ROW LEVEL SECURITY;

-- Create new policies
DO $$
BEGIN
  -- Allow admins full access
  CREATE POLICY "Allow admin full access"
    ON carousel
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow public to read active carousel items
  CREATE POLICY "Allow public read active"
    ON carousel
    FOR SELECT
    TO public
    USING (active = true);
END $$;