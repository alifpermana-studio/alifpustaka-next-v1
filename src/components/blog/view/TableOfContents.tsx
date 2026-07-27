"use client";

import { List } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";

interface TocItem {
  level: 3 | 4;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  content: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function extractHeadings(markdown: string): TocItem[] {
  const headingRegex = /^(###|####)\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length as 3 | 4;
    const text = match[2].trim();
    const id = slugify(text);
    headings.push({ level, text, id });
  }

  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tocItems = useMemo(() => extractHeadings(content), [content]);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const observerOptions = {
      rootMargin: "-100px 0px -66% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleItemClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  };

  const disabled = tocItems.length === 0;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all ${
          disabled
            ? "border-accent-content/10 bg-accent cursor-not-allowed opacity-50"
            : "border-accent-content/20 bg-accent hover:bg-accent/80"
        }`}
        aria-label="Table of contents"
        disabled={disabled}
      >
        <List
          className={`h-5 w-5 ${disabled ? "text-accent-content/30" : "text-accent-content"}`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="border-base-content/20 bg-base-200 absolute z-50 w-64 overflow-hidden rounded-lg border shadow-xl max-lg:bottom-[calc(100%+0.5rem)] max-lg:left-0 md:h-[50vh] lg:top-0 lg:left-[calc(100%+1.5rem)]"
        >
          <div className="my-2 max-h-96 overflow-y-auto p-4">
            <h3 className="text-base-content mb-3 text-sm font-bold">
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`block w-full text-left transition-colors ${
                    item.level === 3
                      ? "text-base-content py-2 font-semibold"
                      : "text-base-content/70 py-1.5 pl-4 text-sm"
                  } ${
                    activeId === item.id
                      ? "bg-primary/10 text-primary rounded px-2"
                      : "hover:text-primary"
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
