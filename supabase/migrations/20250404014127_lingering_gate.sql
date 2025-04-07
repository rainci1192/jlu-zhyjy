/*
  # Add site logo management table

  1. New Table
    - `site_logo`
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access and public read
*/

-- Create site_logo table
CREATE TABLE IF NOT EXISTS site_logo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_logo ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  -- Allow admins full access
  CREATE POLICY "Admin full access"
    ON site_logo
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow public to read active logo
  CREATE POLICY "Public read active"
    ON site_logo
    FOR SELECT
    TO public
    USING (active = true);
END $$;

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-logos', 'site-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DO $$
BEGIN
  -- Allow authenticated users to manage logos
  CREATE POLICY "Allow admin full access to logos"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'site-logos' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'site-logos' AND auth.role() = 'authenticated');

  -- Allow public to read logos
  CREATE POLICY "Allow public read logos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'site-logos');
END $$;