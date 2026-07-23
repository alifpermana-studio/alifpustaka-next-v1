"use client";

import { useState, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import {
  Bell,
  Search,
  Command,
  MenuIcon,
  CircleUser,
  ChevronDown,
  User,
  Settings,
  Bookmark,
  Clock,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { useAuth } from "@/context/AuthContext";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { formatRole } from "@/lib/utils/format-role";

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
    pattern: "/admin",
    title: "Admin Overview",
    subtitle: "Administrator Panel.",
  },
  {
    pattern: "/admin/user-management",
    title: "User Management",
    subtitle: "Manage user roles and status.",
  },
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const { signOut } = useAuth();

  const meta = findPageMeta(pathname, pageMetaConfigs);

  const handleSignOut = async () => {
    setIsUserDropdownOpen(false);
    await signOut();
  };

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

          <button
            ref={userButtonRef}
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="border-surface-700/80 bg-base-300 hover:border-accent/50 hover:bg-surface-800 flex cursor-pointer items-center gap-3 rounded-2xl border px-2 py-1.5 pr-3 transition-all duration-200"
          >
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
              <p className="text-surface-400 text-xs">
                {formatRole(user?.role || "")}
              </p>
            </div>
            <ChevronDown
              className={`text-surface-400 h-4 w-4 transition-transform duration-300 ${
                isUserDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          <Dropdown
            isOpen={isUserDropdownOpen}
            onClose={() => setIsUserDropdownOpen(false)}
            triggerRef={userButtonRef}
            className="border-base-300 animate-in fade-in slide-in-from-top-2 text-base-content bg-base-300/40 flex w-56 flex-col rounded-2xl border p-2 shadow-lg backdrop-blur-lg duration-200"
          >
            <ul className="flex flex-col gap-1 py-1">
              <li>
                <DropdownItem
                  tag="a"
                  href={`/p/${user?.username}`}
                  onItemClick={() => setIsUserDropdownOpen(false)}
                  className="group hover:text-accent hover:bg-base-100/30 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag="a"
                  href="/settings"
                  onItemClick={() => setIsUserDropdownOpen(false)}
                  className="group hover:bg-base-100/30 hover:text-accent flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag="a"
                  href="/saved"
                  onItemClick={() => setIsUserDropdownOpen(false)}
                  className="group hover:bg-base-100/30 hover:text-accent flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                  Saved
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag="a"
                  href="/history"
                  onItemClick={() => setIsUserDropdownOpen(false)}
                  className="group hover:bg-base-100/30 hover:text-accent flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <Clock className="h-4 w-4" />
                  History
                </DropdownItem>
              </li>
              <li className="border-base-300 mt-1 border-t pt-1">
                <DropdownItem
                  tag="button"
                  onClick={handleSignOut}
                  className="group hover:bg-base-100/30 hover:text-accent flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownItem>
              </li>
            </ul>
          </Dropdown>

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
