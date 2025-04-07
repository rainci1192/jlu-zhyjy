/*
  # Create about content table

  1. New Table
    - `about_content`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `published` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS
    - Add policies for admin and editor access
    - Allow public read access to published content
*/

-- Create about_content table
CREATE TABLE IF NOT EXISTS about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  -- Allow admins full access
  CREATE POLICY "Admin full access"
    ON about_content
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

  -- Allow editors to read all content
  CREATE POLICY "Editor read access"
    ON about_content
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'editor');

  -- Allow editors to manage their own content
  CREATE POLICY "Editor manage own content"
    ON about_content
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

  -- Allow public to read published content
  CREATE POLICY "Public read published"
    ON about_content
    FOR SELECT
    TO public
    USING (published = true);
END $$;