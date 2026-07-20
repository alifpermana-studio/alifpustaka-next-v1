"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Skills from "@/components/home/Skills";
import Stats from "@/components/home/Stats";
import Projects from "@/components/home/Projects";
import Services from "@/components/home/Services";
import Contact from "@/components/home/Contact";
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
