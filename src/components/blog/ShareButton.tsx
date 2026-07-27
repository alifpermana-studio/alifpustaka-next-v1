"use client";

import { MotionValue } from "framer-motion";
import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ShareButtonProps {
  progress?: MotionValue<number>;
  title: string;
  url: string;
}

export function ShareButton({ progress, title, url }: ShareButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [percentage, setPercentage] = useState(0);

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

  useEffect(() => {
    const unsubscribe = progress
      ? progress.on("change", (latest) => {
          setPercentage(Math.round(latest * 100));
        })
      : () => {};

    return () => unsubscribe();
  }, [progress]);

  return (
    <button
      onClick={handleShare}
      className={`${percentage <= 0 ? "hidden md:flex" : "flex"} group bg-accent hover:bg-accent/80 relative h-12 w-12 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all`}
      aria-label="Share post"
    >
      <Share2 className="text-accent-content h-5 w-5" />
      {showTooltip && (
        <div className="text-accent-content bg-accent absolute left-full ml-2 rounded px-2 py-1 text-xs whitespace-nowrap">
          Copied to clipboard!
        </div>
      )}
    </button>
  );
}
