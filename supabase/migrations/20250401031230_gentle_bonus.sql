/*
  # Create campus scenery table and policies

  1. New Table
    - `campus_scenery`
      - `id` (uuid, primary key)
      - `title` (text) - Image title
      - `image` (text) - Image URL
      - `display_order` (integer) - Display order
      - `active` (boolean) - Whether to show the image
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access and public read
*/

-- Create campus scenery table
CREATE TABLE IF NOT EXISTS campus_scenery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image text NOT NULL,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE campus_scenery ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  -- Allow admins full access
  CREATE POLICY "Admin full access"
    ON campus_scenery
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow public to read active items
  CREATE POLICY "Public read active"
    ON campus_scenery
    FOR SELECT
    TO public
    USING (active = true);
END $$;

-- Create storage bucket for campus scenery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('campus-scenery', 'campus-scenery', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DO $$
BEGIN
  -- Allow authenticated users to manage campus scenery images
  CREATE POLICY "Allow admin full access to campus scenery"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'campus-scenery' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'campus-scenery' AND auth.role() = 'authenticated');

  -- Allow public to read campus scenery images
  CREATE POLICY "Allow public read campus scenery"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'campus-scenery');
END $$;