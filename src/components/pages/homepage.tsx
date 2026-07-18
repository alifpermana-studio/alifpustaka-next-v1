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
import { useTheme } from "@/context/ThemeContext";

function Homepage() {
  return (
    <main>
      <Hero />
      <About />
      <Skills />
      <Stats />
      <Projects />
      <Services />
      <Contact />
    </main>
  );
}

export default Homepage;
