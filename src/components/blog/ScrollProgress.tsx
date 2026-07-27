"use client";

import { motion, MotionValue, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function ScrollProgress({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const [percentage, setPercentage] = useState(0);

  const scaleY = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      setPercentage(Math.round(latest * 100));
    });

    return () => unsubscribe();
  }, [progress]);

  const circumference = 2 * Math.PI * 22;

  return (
    <>
      <div className="relative hidden h-16 w-16 items-center justify-center lg:flex">
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            cx="32"
            cy="32"
            r="29"
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
            className="text-base-content/20"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="29"
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            className="text-accent"
            style={{
              pathLength: scaleY,
            }}
            strokeDasharray={circumference}
            strokeDashoffset="0"
          />
        </svg>
        <div className="text-base-content absolute text-xs font-semibold">
          {percentage}%
        </div>
      </div>
      <div
        className={`${percentage >= 100 ? "opacity-0" : "opacity-100"} transition-opacity duration-300 ease-in-out`}
      >
        <motion.div
          className="bg-accent left-0 z-50 mb-0 flex h-2 origin-left rounded-full lg:hidden"
          style={{ scaleX: progress }}
        />
      </div>
    </>
  );
}
