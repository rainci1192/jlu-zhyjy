/*
  # Create storage buckets and policies

  1. Storage Buckets
    - Create 'news-images' bucket for storing news images
    - Create 'news-attachments' bucket for storing news attachments
    
  2. Security
    - Enable public access to both buckets
    - Add policies for authenticated users to manage files
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('news-attachments', 'news-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for news-images bucket
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'news-images' AND
  ((auth.jwt() ->> 'role')::text = 'editor' OR 
   (auth.jwt() ->> 'role')::text = 'admin')
);

CREATE POLICY "Allow public to read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'news-images');

-- Storage policies for news-attachments bucket
CREATE POLICY "Allow authenticated users to upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'news-attachments' AND
  ((auth.jwt() ->> 'role')::text = 'editor' OR 
   (auth.jwt() ->> 'role')::text = 'admin')
);

CREATE POLICY "Allow public to read attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'news-attachments');