-- Storage RLS policies for post-images bucket
-- Run this in Supabase SQL Editor after creating the "post-images" bucket in Storage.

-- Remove existing policies if you're re-running (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Public read post-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload post-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own post-images" ON storage.objects;

-- Allow anyone to read (view) images from post-images
CREATE POLICY "Public read post-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- Allow authenticated users (including anonymous) to upload to post-images
CREATE POLICY "Authenticated users can upload post-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- Allow users to delete their own uploads (path starts with their user id)
CREATE POLICY "Users can delete own post-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
