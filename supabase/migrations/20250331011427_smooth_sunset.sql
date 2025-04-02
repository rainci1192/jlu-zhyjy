/*
  # Create Admin System Tables

  1. New Tables
    - `users` - Admin users table
    - `departments` - Department management
    - `site_settings` - Website configuration
    - `news` - News articles
    - `notifications` - Notifications and announcements
    - `admissions` - Admission information
    - `carousel` - Homepage carousel
    - `research_platforms` - Research platforms
    - `campus_scenery` - Campus photos

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  department text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read departments"
  ON departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read site settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  thumbnail text,
  images jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read news"
  ON news
  FOR SELECT
  TO authenticated
  USING (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Admissions table
CREATE TABLE IF NOT EXISTS admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read admissions"
  ON admissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Carousel table
CREATE TABLE IF NOT EXISTS carousel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read carousel"
  ON carousel
  FOR SELECT
  TO authenticated
  USING (true);

-- Research platforms table
CREATE TABLE IF NOT EXISTS research_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text NOT NULL,
  image text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE research_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read research platforms"
  ON research_platforms
  FOR SELECT
  TO authenticated
  USING (true);

-- Campus scenery table
CREATE TABLE IF NOT EXISTS campus_scenery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campus_scenery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read campus scenery"
  ON campus_scenery
  FOR SELECT
  TO authenticated
  USING (true);

-- Create write policies for admin users
DO $$
DECLARE
  tables text[] := ARRAY['users', 'departments', 'site_settings', 'news', 'notifications', 
                        'admissions', 'carousel', 'research_platforms', 'campus_scenery'];
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('
      CREATE POLICY "Admin users can insert rows" ON %I
        FOR INSERT TO authenticated
        WITH CHECK (auth.jwt() ->> ''role'' = ''admin'');
      
      CREATE POLICY "Admin users can update rows" ON %I
        FOR UPDATE TO authenticated
        USING (auth.jwt() ->> ''role'' = ''admin'')
        WITH CHECK (auth.jwt() ->> ''role'' = ''admin'');
      
      CREATE POLICY "Admin users can delete rows" ON %I
        FOR DELETE TO authenticated
        USING (auth.jwt() ->> ''role'' = ''admin'');
    ', table_name, table_name, table_name);
  END LOOP;
END $$;

-- Create write policies for editors
DO $$
DECLARE
  tables text[] := ARRAY['news', 'notifications', 'admissions'];
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('
      CREATE POLICY "Editors can insert rows" ON %I
        FOR INSERT TO authenticated
        WITH CHECK (
          auth.jwt() ->> ''role'' = ''editor'' OR 
          auth.jwt() ->> ''role'' = ''admin''
        );
      
      CREATE POLICY "Editors can update own rows" ON %I
        FOR UPDATE TO authenticated
        USING (
          created_by = auth.uid() AND
          (auth.jwt() ->> ''role'' = ''editor'' OR auth.jwt() ->> ''role'' = ''admin'')
        )
        WITH CHECK (
          created_by = auth.uid() AND
          (auth.jwt() ->> ''role'' = ''editor'' OR auth.jwt() ->> ''role'' = ''admin'')
        );
      
      CREATE POLICY "Editors can delete own rows" ON %I
        FOR DELETE TO authenticated
        USING (
          created_by = auth.uid() AND
          (auth.jwt() ->> ''role'' = ''editor'' OR auth.jwt() ->> ''role'' = ''admin'')
        );
    ', table_name, table_name, table_name);
  END LOOP;
END $$;