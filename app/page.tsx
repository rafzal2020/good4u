"use client";

import { useEffect } from "react";
import { useSupabase } from "@/lib/supabase-client";
import { Feed } from "@/components/Feed";
import { PostForm } from "@/components/PostForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const { signInAnonymously, user, loading } = useSupabase();

  useEffect(() => {
    if (!loading && !user) {
      signInAnonymously();
    }
  }, [user, loading, signInAnonymously]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-400 dark:border-purple-400 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 dark:from-pink-300 dark:via-purple-300 dark:to-blue-300 mb-2">
            Good4U
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Share your positive moments ✨
          </p>
        </div>

        <PostForm />

        <Feed />
      </div>
    </main>
  );
}
