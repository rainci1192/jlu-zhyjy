/*
  # Fix news table RLS policies

  1. Changes
    - Add admin-specific policies to allow full access
    - Fix editor policies to properly check roles
    
  2. Security
    - Ensure admins have full access
    - Maintain editor access to own content
    - Keep public read access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read news" ON news;
DROP POLICY IF EXISTS "Editors can insert news" ON news;
DROP POLICY IF EXISTS "Editors can update own news" ON news;
DROP POLICY IF EXISTS "Editors can delete own news" ON news;

-- Create new policies
DO $$
BEGIN
  -- Allow public to read published news
  CREATE POLICY "Public can read published news"
    ON news
    FOR SELECT
    TO public
    USING (published = true);

  -- Allow admins full access
  CREATE POLICY "Admins have full access"
    ON news
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

  -- Allow editors to read all news
  CREATE POLICY "Editors can read all news"
    ON news
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'editor');

  -- Allow editors to insert news
  CREATE POLICY "Editors can insert news"
    ON news
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'editor');

  -- Allow editors to update own news
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

  -- Allow editors to delete own news
  CREATE POLICY "Editors can delete own news"
    ON news
    FOR DELETE
    TO authenticated
    USING (
      created_by = auth.uid() AND
      (auth.jwt() ->> 'role')::text = 'editor'
    );
END $$;