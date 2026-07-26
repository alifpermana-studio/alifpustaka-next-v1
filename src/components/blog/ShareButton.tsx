"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  title: string;
  url: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  return (
    <div className="sticky top-24">
      <button
        onClick={handleShare}
        className="group relative flex items-center justify-center rounded-full bg-white p-3 shadow-lg transition-all hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-label="Share post"
      >
        <Share2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        {showTooltip && (
          <div className="absolute left-full ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white dark:bg-gray-700">
            Copied to clipboard!
          </div>
        )}
      </button>
    </div>
  );
}
