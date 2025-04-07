-- Create storage bucket for about page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('about-images', 'about-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DO $$
BEGIN
  -- Allow authenticated users to manage about images
  CREATE POLICY "Allow admin full access to about images"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'about-images' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'about-images' AND auth.role() = 'authenticated');

  -- Allow public to read about images
  CREATE POLICY "Allow public read about images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'about-images');
END $$;