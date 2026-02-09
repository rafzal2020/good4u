-- Add optional image URL to posts (stores Supabase Storage public URL)
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Allow image-only posts (content can be empty)
ALTER TABLE posts
  ALTER COLUMN content DROP NOT NULL;
