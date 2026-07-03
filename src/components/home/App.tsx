"use client";

import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Skills from "@/components/home/Skills";
import Stats from "@/components/home/Stats";
import Projects from "@/components/home/Projects";
import Services from "@/components/home/Services";
import Contact from "@/components/home/Contact";
import Footer from "@/components/home/Footer";
import { useState, useEffect } from "react";

function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#060912] font-sans text-slate-200 selection:bg-sky-400/30 selection:text-white">
      <div
        className="pointer-events-none fixed z-50 h-100 w-100 opacity-20 transition-opacity duration-300"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          background:
            "radial-gradient(circle, rgba(44,67,132,0.9) 20%, transparent 70%)",
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

export default App;
