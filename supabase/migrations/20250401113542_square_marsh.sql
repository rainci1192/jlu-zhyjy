/*
  # Navigation System Setup

  1. New Tables
    - `navigation_items`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `link` (text, required)
      - `has_submenu` (boolean)
      - `parent_id` (uuid, self-referencing foreign key)
      - `display_order` (integer)
      - `icon` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `navigation_items` table
    - Add policies for admin management and public read access
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin users can manage navigation items" ON navigation_items;
  DROP POLICY IF EXISTS "Public users can read navigation items" ON navigation_items;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create or update the table
CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  link text NOT NULL,
  has_submenu boolean DEFAULT false,
  parent_id uuid REFERENCES navigation_items(id),
  display_order integer DEFAULT 0,
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Admin users can manage navigation items"
  ON navigation_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public users can read navigation items"
  ON navigation_items
  FOR SELECT
  TO public
  USING (true);