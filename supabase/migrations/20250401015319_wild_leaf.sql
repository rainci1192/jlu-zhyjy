/*
  # Create research platforms table and policies

  1. New Table
    - `research_platforms`
      - `id` (uuid, primary key)
      - `title` (text) - Platform name in Chinese
      - `subtitle` (text) - Platform name in English (optional)
      - `description` (text) - Platform description
      - `image` (text) - Platform image URL
      - `display_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access and public read
*/

-- Create research platforms table
CREATE TABLE IF NOT EXISTS research_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text NOT NULL,
  image text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE research_platforms ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  -- Allow admins full access
  CREATE POLICY "Admin full access"
    ON research_platforms
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow public to read
  CREATE POLICY "Public read access"
    ON research_platforms
    FOR SELECT
    TO public
    USING (true);
END $$;

-- Create storage bucket for platform images
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-images', 'platform-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DO $$
BEGIN
  -- Allow authenticated users to manage platform images
  CREATE POLICY "Allow admin full access to platform images"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'platform-images' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'platform-images' AND auth.role() = 'authenticated');

  -- Allow public to read platform images
  CREATE POLICY "Allow public read platform images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'platform-images');
END $$;