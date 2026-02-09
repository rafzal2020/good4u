# Good4U

A lightweight, anonymous social media platform where users post positive moments from their lives. Other anonymous users can "cheer" (like) posts to encourage positivity.

## Features

- Complete Anonymous!
- Share positive moments and include photos of your news
- "Cheer" other people's positive posts
- Posts update in real time
- Dark and Light Themes

## Tech Stack

- **Frontend**: Next.js 15+ (App Router), React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, RLS, Realtime, Anonymous Auth)
- **State Management**: TanStack React Query

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your project URL and anon key
3. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `database/schema.sql` to create all tables, indexes, and RLS policies as well as all the scripts in `migrations\`

### 4. Enable Anonymous Auth

1. In Supabase dashboard, go to Authentication > Providers
2. Enable "Anonymous" provider
3. Save the changes

### 5. Enable Realtime (for live updates)

1. In Supabase dashboard, go to Database > Replication
2. Enable replication for the `posts` and `cheers` tables
3. This allows the feed to update in realtime when new posts or cheers are added

### 6. Setting up Photo Support

1. Run the migration `database/migrations/001_add_post_images.sql` in the SQL Editor (adds `image_url` to `posts` and allows image-only posts).
2. In Supabase dashboard go to **Storage** and create a new bucket:
   - Name: `post-images`
   - Public bucket: **Yes**
   - File size limit: 5 MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
3. Run the migration `database/migrations/002_storage_policies.sql` in the SQL Editor. This adds the required RLS policies so authenticated users can upload and the public can view images. Without it you’ll get “new row violates row-level security policy” on upload.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx             # Main feed page
│   ├── providers.tsx        # React Query and Supabase providers
│   └── globals.css          # Global styles
├── components/
│   ├── Feed.tsx             # Infinite scroll feed component
│   ├── PostCard.tsx         # Individual post card component
│   └── PostForm.tsx         # Post creation form
├── lib/
│   ├── supabase.ts          # Supabase client (server-side)
│   └── supabase-client.tsx  # Supabase client with React context
├── database/
│   └── schema.sql           # Database schema and RLS policies
└── project_spec.txt         # Project specifications
```

## Database Schema

- **users**: Anonymous user records
- **posts**: User posts (max 280 characters; optional `image_url` for photos)
- **cheers**: Like/cheer records (one per user per post)

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Rate Limiting

- Maximum 1 cheer per post per user (enforced by database)
- Maximum 1 cheer per post per user (enforced by unique constraint)

## License

ISC
