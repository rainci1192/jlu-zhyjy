/*
  # Fix RLS policies for admin access

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create simplified policies that prioritize admin access
    - Ensure storage buckets have proper admin access policies
    
  2. Security
    - Give admins unrestricted access to all operations
    - Maintain existing editor and public access rules
*/

-- Drop existing news policies
DROP POLICY IF EXISTS "Allow admins full access to news" ON news;
DROP POLICY IF EXISTS "Allow editors to read all news" ON news;
DROP POLICY IF EXISTS "Allow editors to create news" ON news;
DROP POLICY IF EXISTS "Allow editors to update own news" ON news;
DROP POLICY IF EXISTS "Allow editors to delete own news" ON news;
DROP POLICY IF EXISTS "Allow public to read published news" ON news;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow admins full access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow editors to manage own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read files" ON storage.objects;

-- Create new news policies
DO $$
BEGIN
  -- Give admins unrestricted access to news
  CREATE POLICY "Admin full access"
    ON news
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

  -- Allow editors to read all news
  CREATE POLICY "Editor read access"
    ON news
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'editor');

  -- Allow editors to manage their own news
  CREATE POLICY "Editor manage own news"
    ON news
    FOR ALL
    TO authenticated
    USING (
      (auth.jwt() ->> 'role')::text = 'editor' AND
      created_by = auth.uid()
    )
    WITH CHECK (
      (auth.jwt() ->> 'role')::text = 'editor' AND
      created_by = auth.uid()
    );

  -- Allow public to read published news
  CREATE POLICY "Public read published"
    ON news
    FOR SELECT
    TO public
    USING (published = true);
END $$;

-- Create new storage policies
DO $$
BEGIN
  -- Give admins unrestricted access to storage
  CREATE POLICY "Admin full storage access"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

  -- Allow editors to manage files in news buckets
  CREATE POLICY "Editor storage access"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
      (auth.jwt() ->> 'role')::text = 'editor' AND
      bucket_id IN ('news-images', 'news-attachments')
    )
    WITH CHECK (
      (auth.jwt() ->> 'role')::text = 'editor' AND
      bucket_id IN ('news-images', 'news-attachments')
    );

  -- Allow public to read files
  CREATE POLICY "Public storage read"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id IN ('news-images', 'news-attachments'));
END $$;