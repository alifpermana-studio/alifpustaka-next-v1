"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <div className="bg-base-100 text-base-content min-h-screen font-sans selection:bg-sky-400/30 selection:text-white">
          <div
            className="pointer-events-none fixed z-50 h-100 w-100 opacity-20 transition-opacity duration-300"
            style={{
              left: mousePos.x - 200,
              top: mousePos.y - 200,
              background: `radial-gradient(circle, ${theme === "dark" ? "rgba(44,67,132,0.9)" : "rgba(249, 248, 113,0.9)"} 20%, transparent 70%)`,
            }}
          />
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
