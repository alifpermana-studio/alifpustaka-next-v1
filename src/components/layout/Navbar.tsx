"use client";

import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import {
  APusColorSquare,
  APusDarkBanner,
  APusLightBanner,
} from "@/icons/web-assets";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "../ui/ThemeSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(href);
    }
  };

  const handleLoginClick = () => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";
    window.location.href = `${adminUrl}/signin?returnUrl=${encodeURIComponent(window.location.href)}`;
  };

  const handleDashboardClick = () => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";
    window.location.href = `${adminUrl}/p`;
  };

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base-200/80 border-base-content/10 border-b backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
          >
            {theme === "dark" ? (
              <div className="flex items-center gap-3">
                <APusColorSquare className="w-8" />
                <APusLightBanner className="h-fit w-40" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <APusColorSquare className="w-8" />
                <APusDarkBanner className="h-fit w-40" />
              </div>
            )}
          </button>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="text-base-content hover:bg-base-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}
            {isAuthenticated && user ? (
              <button
                onClick={handleDashboardClick}
                className="bg-neutral text-neutral-content hover:bg-neutral/70 mx-2 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
              >
                <User className="h-4 w-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-neutral text-neutral-content hover:bg-neutral/70 mx-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
              >
                Login
              </button>
            )}
            <ThemeSwitcher />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-base-content hover:text-base-content/80 p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="bg-base-200/95 border-base-content/10 border-b backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-6 py-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="text-base-content hover:bg-base-300 block w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}
            {isAuthenticated && user ? (
              <button
                onClick={handleDashboardClick}
                className="bg-neutral text-neutral-content hover:bg-neutral/70 mt-3 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors"
              >
                <User className="h-4 w-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-neutral text-neutral-content hover:bg-neutral/70 mt-3 w-full cursor-pointer rounded-full px-5 py-3 text-sm font-semibold transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
