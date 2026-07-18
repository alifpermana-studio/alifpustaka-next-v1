"use client";

import { useUser } from "@/hooks/useUser";
import { Bell, Search, Command, MenuIcon, CircleUser } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

interface HeaderProps {
  /* title: string;
  subtitle?: string; */
  onMenuClick: () => void;
}

interface PageMetaConfig {
  pattern: string;
  title: string;
  subtitle: string;
}

const pageMetaConfigs: PageMetaConfig[] = [
  {
    pattern: "/dashboard",
    title: "Dashboard",
    subtitle: "Overview of revenue, users, and operational health",
  },
  {
    pattern: "/blog",
    title: "Blog Management",
    subtitle: "List of your blog post content",
  },
  {
    pattern: "/blog/editor",
    title: "Text Editor",
    subtitle: "Create or edit your blog post",
  },
  { pattern: "/gallery", title: "Gallery", subtitle: "Upload your image here" },
  {
    pattern: "/p/*",
    title: "Profile",
    subtitle: "Your admin identity and account security",
  }, // NEW: handles /p/username
  {
    pattern: "/settings",
    title: "Settings",
    subtitle: "Workspace preferences and notification controls",
  },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of revenue, users, and operational health",
  },
  "/blog": {
    title: "Blog Management",
    subtitle: "List of your blog post content",
  },
  "/blog/editor": {
    title: "Text Editor",
    subtitle: "Create or edit your blog post",
  },
  "/gallery": {
    title: "Gallery",
    subtitle: "Upload your image here",
  },
  "/p": {
    title: "Profile",
    subtitle: "Your admin identity and account security",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Workspace preferences and notification controls",
  },
};

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const meta = findPageMeta(pathname, pageMetaConfigs);

  return (
    <header className="border-base-300 bg-base-200 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onMenuClick}
            className="border-surface-700 bg-surface-900 text-surface-300 mt-0.5 rounded-xl border p-2 hover:text-white lg:hidden"
            aria-label="Open sidebar"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base-content text-xl font-semibold tracking-tight md:text-2xl">
              {meta.title}
            </h1>
            {meta.subtitle ? (
              <p className="text-base-content mt-1 text-sm">{meta.subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 lg:max-w-xl">
          <div className="border-base-300/80 text-base-content bg-base-200/80 ring-accent/40 relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search users, orders, products..."
              className="placeholder:text-base-content/50 h-11 w-full rounded-xl border pr-16 pl-10 text-sm outline-none focus:ring-1"
            />
            <span className="border-surface-700 bg-surface-800 text-surface-400 absolute top-1/2 right-3 inline-flex -translate-y-1/2 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]">
              <Command className="h-3 w-3" />K
            </span>
          </div>

          <button className="border-surface-700 bg-surface-900 text-surface-300 relative rounded-xl border p-2.5 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="bg-accent absolute top-2 right-2 h-2 w-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
          </button>

          <div className="border-surface-700/80 bg-surface-900 flex items-center gap-3 rounded-2xl border px-2 py-1.5 pr-3">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Admin avatar"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover"
              />
            ) : (
              <CircleUser className="text-surface-400 h-9 w-9 rounded-xl" />
            )}
            <div className="hidden sm:block">
              <p className="text-accent text-sm font-medium">{user?.name}</p>
              <p className="text-surface-400 text-xs">{user?.role}</p>
            </div>
          </div>

          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

function findPageMeta(
  pathname: string,
  configs: PageMetaConfig[],
): { title: string; subtitle: string } {
  const normalizedPath = pathname.toLowerCase();

  for (const config of configs) {
    const normalizedPattern = config.pattern.toLowerCase();

    // Exact match
    if (normalizedPattern === normalizedPath) {
      return { title: config.title, subtitle: config.subtitle };
    }

    // Wildcard match: /p/* matches /p/anything
    if (normalizedPattern.endsWith("/*")) {
      const prefix = normalizedPattern.slice(0, -2); // remove /*
      if (
        normalizedPath === prefix ||
        normalizedPath.startsWith(prefix + "/")
      ) {
        return { title: config.title, subtitle: config.subtitle };
      }
    }
  }

  // Default fallback
  return {
    title: "Admin",
    subtitle: "Alif Pustaka Dashboard",
  };
}
