-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users (anonymous users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: cheers (likes)
CREATE TABLE IF NOT EXISTS cheers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, user_id) -- Ensure one cheer per user per post
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_cheers_post_id ON cheers(post_id);
CREATE INDEX IF NOT EXISTS idx_cheers_user_id ON cheers(user_id);
CREATE INDEX IF NOT EXISTS idx_cheers_post_user ON cheers(post_id, user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheers ENABLE ROW LEVEL SECURITY;

-- Users policies: Anyone can read, authenticated users can insert
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can be created by authenticated users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Posts policies: Anyone can read, authenticated users can insert their own
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

-- Cheers policies: Anyone can read, authenticated users can insert/delete their own
CREATE POLICY "Cheers are viewable by everyone" ON cheers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create cheers" ON cheers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own cheers" ON cheers
  FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

-- Function to get cheer count for a post
CREATE OR REPLACE FUNCTION get_cheer_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM cheers WHERE post_id = post_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has cheered a post
CREATE OR REPLACE FUNCTION has_user_cheered(post_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM cheers WHERE post_id = post_uuid AND user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check post rate limit (3 posts per hour)
CREATE OR REPLACE FUNCTION check_post_rate_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  post_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO post_count
  FROM posts
  WHERE user_id = user_uuid
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN post_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
