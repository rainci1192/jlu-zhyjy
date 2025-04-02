/*
  # Create news table and policies

  1. New Tables
    - `news`
      - `id` (uuid, primary key)
      - `title` (text)
      - `category` (text)
      - `content` (text)
      - `images` (jsonb)
      - `attachments` (jsonb)
      - `published` (boolean)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `news` table
    - Add policies for:
      - Read access for authenticated users
      - Insert/Update/Delete access for editors and admins
      
  3. Indexes
    - Category index for filtering
    - Created_at index for sorting
*/

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'news' 
    AND policyname = 'Authenticated users can read news'
  ) THEN
    CREATE POLICY "Authenticated users can read news"
      ON news
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'news' 
    AND policyname = 'Editors can insert news'
  ) THEN
    CREATE POLICY "Editors can insert news"
      ON news
      FOR INSERT
      TO authenticated
      WITH CHECK (
        (auth.jwt() ->> 'role')::text = 'editor' OR 
        (auth.jwt() ->> 'role')::text = 'admin'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'news' 
    AND policyname = 'Editors can update own news'
  ) THEN
    CREATE POLICY "Editors can update own news"
      ON news
      FOR UPDATE
      TO authenticated
      USING (
        created_by = auth.uid() AND
        ((auth.jwt() ->> 'role')::text = 'editor' OR 
         (auth.jwt() ->> 'role')::text = 'admin')
      )
      WITH CHECK (
        created_by = auth.uid() AND
        ((auth.jwt() ->> 'role')::text = 'editor' OR 
         (auth.jwt() ->> 'role')::text = 'admin')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'news' 
    AND policyname = 'Editors can delete own news'
  ) THEN
    CREATE POLICY "Editors can delete own news"
      ON news
      FOR DELETE
      TO authenticated
      USING (
        created_by = auth.uid() AND
        ((auth.jwt() ->> 'role')::text = 'editor' OR 
         (auth.jwt() ->> 'role')::text = 'admin')
      );
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS news_category_idx ON news(category);
CREATE INDEX IF NOT EXISTS news_created_at_idx ON news(created_at DESC);