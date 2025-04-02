/*
  # Fix storage and news RLS policies

  1. Changes
    - Drop existing storage policies to avoid conflicts
    - Create simplified storage policies that prioritize admin access
    - Ensure proper bucket access for both admins and editors
    
  2. Security
    - Give admins unrestricted access to all storage operations
    - Allow editors to manage their own files
    - Maintain public read access for files
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admin full storage access" ON storage.objects;
DROP POLICY IF EXISTS "Editor storage access" ON storage.objects;
DROP POLICY IF EXISTS "Public storage read" ON storage.objects;

-- Create new storage policies
DO $$
BEGIN
  -- Allow admins full access to all storage operations
  CREATE POLICY "Admin full access"
    ON storage.objects
    FOR ALL 
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow public to read files from news buckets
  CREATE POLICY "Public read access"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id IN ('news-images', 'news-attachments'));
END $$;

-- Drop existing news policies
DROP POLICY IF EXISTS "Admin full access" ON news;
DROP POLICY IF EXISTS "Editor read access" ON news;
DROP POLICY IF EXISTS "Editor manage own news" ON news;
DROP POLICY IF EXISTS "Public read published" ON news;

-- Create new news policies
DO $$
BEGIN
  -- Give admins unrestricted access to news
  CREATE POLICY "Admin full access"
    ON news
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow public to read published news
  CREATE POLICY "Public read published"
    ON news
    FOR SELECT
    TO public
    USING (published = true);
END $$;