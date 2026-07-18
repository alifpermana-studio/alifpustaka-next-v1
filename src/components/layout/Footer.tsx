"use client";

import { useTheme } from "@/context/ThemeContext";
import {
  APusColorSquare,
  APusDarkBanner,
  APusLightBanner,
} from "@/icons/web-assets";
import { Code2, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className="border-base-content/20 border-t py-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <a
            href="#"
            className="text-base-content flex items-center gap-2 font-bold"
          >
            {theme === "dark" ? (
              <div className="flex items-center gap-3">
                <APusColorSquare className="w-8" />
                <APusLightBanner className="text-base-content h-fit w-32" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <APusColorSquare className="w-8" />
                <APusDarkBanner className="text-base-content h-fit w-32" />
              </div>
            )}
          </a>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            © {currentYear} Built with{" "}
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> by
            Alif Pustaka. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#about" className="transition-colors hover:text-sky-400">
              About
            </a>
            <a
              href="#projects"
              className="transition-colors hover:text-sky-400"
            >
              Projects
            </a>
            <a href="#contact" className="transition-colors hover:text-sky-400">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
