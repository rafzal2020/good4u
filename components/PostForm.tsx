"use client";

import { useState, useRef } from "react";
import { useSupabase } from "@/lib/supabase-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "@/lib/uuid";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp";
const MAX_IMAGE_SIZE_MB = 5;

export function PostForm() {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { supabase, user } = useSupabase();
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: async ({
      postContent,
      file,
    }: {
      postContent: string;
      file: File | null;
    }) => {
      if (!user) throw new Error("User not authenticated");

      await supabase
        .from("users")
        .upsert({ id: user.id }, { onConflict: "id" });

      let imageUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadError) throw new Error("Failed to upload image: " + uploadError.message);
        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: postContent.trim() || null,
          ...(imageUrl && { image_url: imageUrl }),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to create post");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !imageFile) || content.length > 280 || isSubmitting) return;
    setIsSubmitting(true);
    createPost.mutate({ postContent: content, file: imageFile });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      alert("Please choose a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      alert(`Image must be under ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const remainingChars = 280 - content.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100 dark:border-gray-600"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something positive that happened today... ✨"
        maxLength={280}
        rows={4}
        className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-purple-400 focus:outline-none resize-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700/50 transition-colors"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />
      {imagePreview && (
        <div className="mt-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-48 rounded-xl border-2 border-purple-200 dark:border-gray-600 object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white text-sm font-bold hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-full border-2 border-purple-200 dark:border-gray-600 text-purple-600 dark:text-purple-300 font-semibold hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors"
          >
            📷 Add photo
          </button>
          <span
            className={`text-sm ${remainingChars < 20 ? "text-red-400" : "text-gray-500 dark:text-gray-400"}`}
          >
            {remainingChars} chars left
          </span>
        </div>
        <button
          type="submit"
          disabled={(!content.trim() && !imageFile) || content.length > 280 || isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-pink-400 to-purple-400 dark:from-pink-500 dark:to-purple-500 text-white rounded-full font-semibold hover:from-pink-500 hover:to-purple-500 dark:hover:from-pink-600 dark:hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md"
        >
          {isSubmitting ? "Posting..." : "Share ✨"}
        </button>
      </div>
    </form>
  );
}
