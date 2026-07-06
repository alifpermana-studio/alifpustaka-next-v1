import { useState, useEffect } from "react";
import { Menu, X, Code2 } from "lucide-react";
import { APusDarkBanner, APusLightBanner } from "@/icons/web-assets";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "../ui/ThemeSwitcher";
import { useTheme } from "@/contexts/ThemeContext";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base-100/80 border-base-content/10 border-b backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <button
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
          >
            {theme === "dark" ? (
              <APusLightBanner className="h-fit w-48" />
            ) : (
              <APusDarkBanner className="h-fit w-48" />
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
            <button
              onClick={() => handleLinkClick("#contact")}
              className="bg-neutral text-neutral-content hover:bg-neutral/70 mx-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            >
              Hire Me
            </button>
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
        <div className="bg-base-100/95 border-base-content/10 border-b backdrop-blur-xl md:hidden">
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
            <button
              onClick={() => handleLinkClick("#contact")}
              className="bg-neutral text-neutral-content hover:bg-neutral/70 mt-3 w-full cursor-pointer rounded-full px-5 py-3 text-sm font-semibold transition-colors"
            >
              Hire Me
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
