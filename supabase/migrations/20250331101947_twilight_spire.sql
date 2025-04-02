/*
  # Fix RLS policies for news and storage

  1. Changes
    - Drop all existing policies to avoid conflicts
    - Create new policies for news table with proper role checks
    - Create new policies for storage buckets with proper role checks
    
  2. Security
    - Allow admins full access to everything
    - Allow editors to manage their own content
    - Allow public read access to published content
*/

-- Drop existing news policies
DROP POLICY IF EXISTS "Public can read published news" ON news;
DROP POLICY IF EXISTS "Admins have full access" ON news;
DROP POLICY IF EXISTS "Editors can read all news" ON news;
DROP POLICY IF EXISTS "Editors can insert news" ON news;
DROP POLICY IF EXISTS "Editors can update own news" ON news;
DROP POLICY IF EXISTS "Editors can delete own news" ON news;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admins have full access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read attachments" ON storage.objects;

-- Create new news policies
DO $$
BEGIN
  -- Allow admins full access to news
  CREATE POLICY "Admins have full access to news"
    ON news
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

  -- Allow editors to read all news
  CREATE POLICY "Editors can read all news"
    ON news
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'editor');

  -- Allow editors to create news
  CREATE POLICY "Editors can create news"
    ON news
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'editor');

  -- Allow editors to update their own news
  CREATE POLICY "Editors can update own news"
    ON news
    FOR UPDATE
    TO authenticated
    USING (
      created_by = auth.uid() AND
      (auth.jwt() ->> 'role')::text = 'editor'
    )
    WITH CHECK (
      created_by = auth.uid() AND
      (auth.jwt() ->> 'role')::text = 'editor'
    );

  -- Allow editors to delete their own news
  CREATE POLICY "Editors can delete own news"
    ON news
    FOR DELETE
    TO authenticated
    USING (
      created_by = auth.uid() AND
      (auth.jwt() ->> 'role')::text = 'editor'
    );

  -- Allow public to read published news
  CREATE POLICY "Public can read published news"
    ON news
    FOR SELECT
    TO public
    USING (published = true);
END $$;

-- Create new storage policies
DO $$
BEGIN
  -- Allow admins full access to storage
  CREATE POLICY "Admins have full access to storage"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

  -- Allow editors to upload and manage their own files
  CREATE POLICY "Editors can manage own files"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
      (auth.jwt() ->> 'role')::text = 'editor' AND
      (bucket_id = 'news-images' OR bucket_id = 'news-attachments')
    )
    WITH CHECK (
      (auth.jwt() ->> 'role')::text = 'editor' AND
      (bucket_id = 'news-images' OR bucket_id = 'news-attachments')
    );

  -- Allow public to read files
  CREATE POLICY "Public can read files"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id IN ('news-images', 'news-attachments'));
END $$;