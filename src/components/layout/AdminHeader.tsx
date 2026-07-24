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
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { formatRole } from "@/lib/utils/format-role";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/types/notification";

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
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const { signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotification();

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

          <button
            ref={notificationButtonRef}
            onClick={() =>
              setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
            }
            className="border-surface-700 bg-surface-900 text-surface-300 relative rounded-xl border p-2.5 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="bg-accent absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
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

          <Dropdown
            isOpen={isNotificationDropdownOpen}
            onClose={() => setIsNotificationDropdownOpen(false)}
            triggerRef={notificationButtonRef}
            className="border-base-300 animate-in fade-in slide-in-from-top-2 text-base-content bg-base-300/40 w-96 rounded-2xl border shadow-lg backdrop-blur-lg duration-200"
          >
            <div className="flex max-h-125 flex-col">
              <div className="border-base-300 flex items-center justify-between border-b p-4">
                <h3 className="text-base font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-accent hover:text-accent/80 text-xs font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-base-content/60 py-12 text-center text-sm">
                    <Bell className="mx-auto mb-3 h-12 w-12 opacity-30" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <ul className="divide-base-300 divide-y">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onClose={() => setIsNotificationDropdownOpen(false)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Dropdown>

          <ThemeSwitcher />
        </div>
      </div>
      <div
        id="notification-portal-anchor"
        className="pointer-events-none absolute top-full right-4"
      />
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

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onClose,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "role_change":
        return <User className="h-5 w-5 text-blue-500" />;
      case "status_change":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "post_approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "post_rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  const content = (
    <div
      className={`hover:bg-base-100/30 flex cursor-pointer gap-3 p-4 transition-colors ${!notification.isRead ? "bg-accent/5" : ""}`}
    >
      <div className="mt-0.5 shrink-0">{getIcon()}</div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${!notification.isRead ? "text-base-content" : "text-base-content/70"}`}
        >
          {notification.title}
        </p>
        <p className="text-base-content/60 mt-1 text-xs">
          {notification.message}
        </p>
        <p className="text-base-content/40 mt-1 text-xs">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="shrink-0">
          <span className="bg-accent block h-2 w-2 rounded-full"></span>
        </div>
      )}
    </div>
  );

  if (notification.linkTo) {
    return (
      <li>
        <Link href={notification.linkTo} onClick={handleClick}>
          {content}
        </Link>
      </li>
    );
  }

  return <li onClick={handleClick}>{content}</li>;
}
