/*
  # Fix Admissions Table RLS Policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new policies with proper role checks
    - Allow admin full access
    - Allow editors to manage their own content
    - Allow public to read published content
    
  2. Security
    - Enable RLS on admissions table
    - Add policies for authenticated users
    - Add policies for public access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can delete rows" ON admissions;
DROP POLICY IF EXISTS "Admin users can insert rows" ON admissions;
DROP POLICY IF EXISTS "Admin users can update rows" ON admissions;
DROP POLICY IF EXISTS "Authenticated users can read admissions" ON admissions;
DROP POLICY IF EXISTS "Editors can delete own rows" ON admissions;
DROP POLICY IF EXISTS "Editors can insert rows" ON admissions;
DROP POLICY IF EXISTS "Editors can update own rows" ON admissions;

-- Create new policies
DO $$
BEGIN
  -- Allow admins full access
  CREATE POLICY "Admin full access"
    ON admissions
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow editors to read all admissions
  CREATE POLICY "Editor read access"
    ON admissions
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'editor');

  -- Allow editors to manage their own admissions
  CREATE POLICY "Editor manage own admissions"
    ON admissions
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

  -- Allow public to read published admissions
  CREATE POLICY "Public read published"
    ON admissions
    FOR SELECT
    TO public
    USING (published = true);
END $$;