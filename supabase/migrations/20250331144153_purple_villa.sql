/*
  # Create carousel images storage bucket

  1. Changes
    - Create storage bucket for carousel images
    - Set up storage policies for access control
    
  2. Security
    - Allow authenticated users to manage files
    - Allow public read access to files
*/

-- Create storage bucket for carousel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin full access to carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read carousel images" ON storage.objects;

-- Create storage policies
DO $$
BEGIN
  -- Allow authenticated users to manage carousel images
  CREATE POLICY "Allow admin full access to carousel images"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'carousel-images' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'carousel-images' AND auth.role() = 'authenticated');

  -- Allow public to read carousel images
  CREATE POLICY "Allow public read carousel images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'carousel-images');
END $$;