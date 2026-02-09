"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostFirstModal } from "@/components/PostFirstModal";

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  cheer_count?: number;
  has_cheered?: boolean;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { supabase, user } = useSupabase();
  const queryClient = useQueryClient();
  const [isCheering, setIsCheering] = useState(false);
  const [showPostFirstModal, setShowPostFirstModal] = useState(false);

  const toggleCheer = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      if (post.has_cheered) {
        // Remove cheer
        const { error } = await supabase
          .from("cheers")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Add cheer
        const { error } = await supabase.from("cheers").insert({
          post_id: post.id,
          user_id: user.id,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to cheer post");
    },
    onSettled: () => {
      setIsCheering(false);
    },
  });

  const handleCheer = async () => {
    if (!user || isCheering) return;
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (count === 0) {
      setShowPostFirstModal(true);
      return;
    }
    setIsCheering(true);
    toggleCheer.mutate();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <PostFirstModal isOpen={showPostFirstModal} onClose={() => setShowPostFirstModal(false)} />
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100 dark:border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {(post.content?.trim() ?? "") !== "" && (
        <p className="text-gray-700 dark:text-gray-200 text-lg mb-4 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}
      {post.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden border border-purple-100 dark:border-gray-600">
          <img
            src={post.image_url}
            alt="Post attachment"
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-purple-100 dark:border-gray-600">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatTimeAgo(post.created_at)}
        </span>
        <button
          onClick={handleCheer}
          disabled={!user || isCheering}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all transform hover:scale-110 active:scale-95 ${
            post.has_cheered
              ? "bg-pink-200 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 hover:bg-pink-300 dark:hover:bg-pink-900/70"
              : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="text-xl">
            {post.has_cheered ? "🎉" : "👏"}
          </span>
          <span>{post.cheer_count || 0}</span>
        </button>
      </div>
    </div>
    </>
  );
}
