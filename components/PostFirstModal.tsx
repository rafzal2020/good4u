"use client";

interface PostFirstModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostFirstModal({ isOpen, onClose }: PostFirstModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-pink-100 dark:border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-gray-700 dark:text-gray-200 text-lg mb-6">
          Make a positive post before interacting with other posts. ✨
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 dark:from-pink-500 dark:to-purple-500 text-white font-semibold hover:from-pink-500 hover:to-purple-500 dark:hover:from-pink-600 dark:hover:to-purple-600 transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
}
