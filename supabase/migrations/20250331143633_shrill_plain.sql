/*
  # Create carousel management table and policies

  1. New Tables
    - `carousel`
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text)
      - `image` (text)
      - `active` (boolean)
      - `display_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Allow public read access
*/

-- Create carousel table
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

-- Create policies
DO $$
BEGIN
  -- Allow admins full access
  CREATE POLICY "Admin full access"
    ON carousel
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow public to read active carousel items
  CREATE POLICY "Public read active"
    ON carousel
    FOR SELECT
    TO public
    USING (active = true);
END $$;