/*
  # Create navigation items table

  1. New Tables
    - `navigation_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `link` (text)
      - `has_submenu` (boolean)
      - `parent_id` (uuid, references navigation_items)
      - `display_order` (integer)
      - `icon` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `navigation_items` table
    - Add policies for authenticated users to manage navigation items
    - Add policy for public users to read navigation items
*/

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

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage navigation items
CREATE POLICY "Admin users can manage navigation items"
  ON navigation_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public users to read navigation items
CREATE POLICY "Public users can read navigation items"
  ON navigation_items
  FOR SELECT
  TO public
  USING (true);