"use client";

import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="bg-accent fixed top-0 right-0 left-0 z-50 h-1 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
