/*
  # Fix storage policies for file uploads

  1. Changes
    - Drop existing storage policies
    - Create new policies with proper role checks
    - Add policies for both buckets (news-images and news-attachments)
    
  2. Security
    - Allow authenticated users with editor/admin roles to upload files
    - Allow public read access to uploaded files
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read attachments" ON storage.objects;

-- Create new storage policies
DO $$
BEGIN
  -- Allow admins full access to all storage objects
  CREATE POLICY "Admins have full access to storage"
    ON storage.objects
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

  -- Allow editors to upload to news-images bucket
  CREATE POLICY "Editors can upload images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'news-images' AND
      (auth.jwt() ->> 'role')::text = 'editor'
    );

  -- Allow editors to upload to news-attachments bucket
  CREATE POLICY "Editors can upload attachments"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'news-attachments' AND
      (auth.jwt() ->> 'role')::text = 'editor'
    );

  -- Allow public to read from news-images bucket
  CREATE POLICY "Public can read images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'news-images');

  -- Allow public to read from news-attachments bucket
  CREATE POLICY "Public can read attachments"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'news-attachments');
END $$;