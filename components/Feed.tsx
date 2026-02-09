"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/lib/supabase-client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard } from "./PostCard";

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  cheer_count?: number;
  has_cheered?: boolean;
}

const PAGE_SIZE = 10;

export function Feed() {
  const { supabase, user } = useSupabase();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      // Get cheer counts and user's cheer status for each post
      const postsWithCheers = await Promise.all(
        (data || []).map(async (post) => {
          const { count } = await supabase
            .from("cheers")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          let hasCheered = false;
          if (user) {
            const { data: cheerData } = await supabase
              .from("cheers")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .single();

            hasCheered = !!cheerData;
          }

          return {
            ...post,
            cheer_count: count || 0,
            has_cheered: hasCheered,
          };
        })
      );

      return {
        posts: postsWithCheers,
        nextPage: postsWithCheers.length === PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cheers",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-400 dark:border-purple-400 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading positive moments...</p>
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 dark:border-gray-600 animate-fade-in">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No posts yet. Be the first to share something positive! ✨
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post, index) => (
        <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
          <PostCard post={post} />
        </div>
      ))}
      {hasNextPage && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-purple-600 dark:text-purple-300 rounded-full font-semibold hover:bg-white dark:hover:bg-gray-700 transition-all transform hover:scale-105 shadow-md border border-purple-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
