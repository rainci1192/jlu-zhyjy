/*
  # Fix notifications table RLS policies

  1. Changes
    - Drop existing notifications RLS policies
    - Create new policies that allow proper access for editors and admins
    - Ensure proper insert permissions for authenticated users
    
  2. Security
    - Allow admins full access
    - Allow editors to manage their own notifications
    - Allow public to read published notifications
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can delete rows" ON notifications;
DROP POLICY IF EXISTS "Admin users can insert rows" ON notifications;
DROP POLICY IF EXISTS "Admin users can update rows" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can read notifications" ON notifications;
DROP POLICY IF EXISTS "Editors can delete own rows" ON notifications;
DROP POLICY IF EXISTS "Editors can insert rows" ON notifications;
DROP POLICY IF EXISTS "Editors can update own rows" ON notifications;

-- Create new policies
DO $$
BEGIN
  -- Give admins unrestricted access
  CREATE POLICY "Admin full access"
    ON notifications
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

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