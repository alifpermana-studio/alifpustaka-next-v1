"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/ui/Hero";
import About from "@/components/ui/About";
import Skills from "@/components/ui/Skills";
import Stats from "@/components/ui/Stats";
import Projects from "@/components/ui/Projects";
import Services from "@/components/ui/Services";
import Contact from "@/components/ui/Contact";
import Footer from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

function Homepage() {
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
      <main>
        <Hero />
        <About />
        <Skills />
        <Stats />
        <Projects />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default Homepage;
