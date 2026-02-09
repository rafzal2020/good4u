"use client";

import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-pink-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <span className="text-xl" title="Dark mode">🌙</span>
      ) : (
        <span className="text-xl" title="Light mode">☀️</span>
      )}
    </button>
  );
}
