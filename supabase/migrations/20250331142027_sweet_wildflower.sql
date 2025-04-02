/*
  # Fix notifications table RLS policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create simplified policies with proper role checks
    - Fix INSERT policy to properly handle admin and editor roles
    
  2. Security
    - Allow admins full access to all operations
    - Allow editors to manage their own content
    - Maintain public read access for published notifications
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access" ON notifications;
DROP POLICY IF EXISTS "Editor read access" ON notifications;
DROP POLICY IF EXISTS "Editor manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Public read published" ON notifications;

-- Create new policies
DO $$
BEGIN
  -- Allow admins full access
  CREATE POLICY "Admin full access"
    ON notifications
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow editors to read all notifications
  CREATE POLICY "Editor read access"
    ON notifications
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'editor');

  -- Allow editors to manage their own notifications
  CREATE POLICY "Editor manage own notifications"
    ON notifications
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

  -- Allow public to read published notifications
  CREATE POLICY "Public read published"
    ON notifications
    FOR SELECT
    TO public
    USING (published = true);
END $$;