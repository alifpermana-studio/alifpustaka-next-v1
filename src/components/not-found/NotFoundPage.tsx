"use client";

import { useState, useMemo } from "react";
import { Search, Home, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { PAGE_LIST } from "@/data/page-list";

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return PAGE_LIST;

    const query = searchQuery.toLowerCase();
    return PAGE_LIST.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        page.path.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="bg-base-100 flex min-h-screen flex-col">
      <div className="mt-12 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-2xl text-center">
          <div className="mb-8">
            <h1 className="text-primary mb-4 text-8xl font-bold md:text-9xl">
              404
            </h1>
            <h2 className="text-base-content mb-2 text-2xl font-semibold md:text-3xl">
              Page Not Found
            </h2>
            <p className="text-base-content/70 text-sm md:text-base">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>

          <div className="mb-8">
            <button
              onClick={() => handleNavigate("/")}
              className="bg-primary text-primary-content hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 font-semibold transition-colors"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </button>
          </div>

          <div className="border-base-content/10 bg-base-200/50 mt-12 rounded-2xl border p-6 backdrop-blur-sm md:p-8">
            <div className="mb-6 text-center">
              <h3 className="text-base-content mb-2 text-lg font-semibold">
                Find Your Way
              </h3>
              <p className="text-base-content/60 text-sm">
                Search for available pages
              </p>
            </div>

            <div className="relative mb-6">
              <Search className="text-base-content/40 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-base-content/10 focus:border-primary bg-base-100 placeholder:text-base-content/40 text-base-content w-full rounded-full border px-12 py-3 text-sm transition-colors outline-none"
              />
            </div>

            {filteredPages.length > 0 ? (
              <div className="space-y-2">
                {filteredPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handleNavigate(page.path)}
                    className="hover:bg-base-300/50 border-base-content/10 group bg-base-100 flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="text-base-content font-semibold">
                          {page.title}
                        </h4>
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                          {page.category}
                        </span>
                      </div>
                      <p className="text-base-content/60 text-sm">
                        {page.description}
                      </p>
                      <p className="text-base-content/40 mt-1 font-mono text-xs">
                        {page.path}
                      </p>
                    </div>
                    <ArrowRight className="text-base-content/40 group-hover:text-primary h-5 w-5 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-base-content/60 text-sm">
                  No pages found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
