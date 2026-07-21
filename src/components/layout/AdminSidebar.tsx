import { useTheme } from "@/context/ThemeContext";
import {
  APusColorSquare,
  APusDarkBanner,
  APusLightBanner,
} from "@/icons/web-assets";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  UserCircle2,
  Hexagon,
  X,
  SquareArrowRightExit,
  NotebookTextIcon,
  ImagesIcon,
  ChevronDown,
  PenSquare,
  FileText,
  Trash2,
  ImagePlus,
  FolderOpen,
  Archive,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SubMenuItem {
  to: string;
  label: string;
  icon: any;
}

interface NavItem {
  to?: string;
  label: string;
  icon: any;
  subMenu?: SubMenuItem[];
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
  {
    label: "Blog",
    icon: NotebookTextIcon,
    subMenu: [
      { to: "/blog/editor", label: "Editor", icon: PenSquare },
      { to: "/blog", label: "Overview", icon: FileText },
      { to: "/blog/trash", label: "Trash", icon: Trash2 },
    ],
  },
  {
    label: "Gallery",
    icon: ImagesIcon,
    subMenu: [
      { to: "/gallery/upload", label: "Upload", icon: ImagePlus },
      { to: "/gallery/browse", label: "Browse", icon: FolderOpen },
      { to: "/gallery/archived", label: "Archived", icon: Archive },
    ],
  },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [expand, setExpand] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { theme } = useTheme();

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const isDropdownOpen = (label: string) => openDropdown === label;

  return (
    <>
      <aside
        className={`border-base-300 bg-base-200 fixed inset-y-0 left-0 z-50 flex max-h-screen flex-col justify-between border-r backdrop-blur-xl transition-all duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-base-300 ml-0 flex items-start border-b px-3 py-6">
          <div
            className={`flex w-full items-center px-1.5 ${expand ? "gap-3" : "gap-0"}`}
          >
            <APusColorSquare className="h-8 w-8 shrink-0" />
            <div
              className={`transition-all duration-300 ${
                expand
                  ? "w-44 translate-x-0 opacity-100"
                  : "w-0 -translate-x-4 opacity-0"
              }`}
            >
              {theme === "dark" ? (
                <APusLightBanner className="h-10 w-fit" />
              ) : (
                <APusDarkBanner className="h-10 w-fit" />
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="tex-base-content hover:bg-base-300 hover:text-base-content/80 rounded-lg p-2 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="ml-0 h-full space-y-1 overflow-x-hidden overflow-y-auto px-3 py-4">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const hasSubMenu = item.subMenu && item.subMenu.length > 0;
            const isOpen = isDropdownOpen(item.label);

            return (
              <div key={i}>
                {hasSubMenu ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`text-base-content hover:bg-base-300/80 hover:text-accent flex w-full items-center justify-between transition-all ${expand ? "gap-3" : "gap-0"} rounded-xl border border-transparent px-3 py-2.5 font-medium`}
                    >
                      <div
                        className={`flex items-center ${expand ? "gap-3" : "gap-0"}`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <p
                          className={`text-left text-sm transition-all duration-300 ${
                            expand
                              ? "w-30 translate-x-0 opacity-100"
                              : "w-0 -translate-x-4 overflow-hidden opacity-0"
                          }`}
                        >
                          {item.label}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-4 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : "rotate-0"
                        } ${expand ? "w-4 translate-x-0 opacity-100" : "w-0 -translate-x-4 opacity-0"}`}
                      />
                    </button>
                    {/* Submenu */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen && expand
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div
                        className={`border-base-300 mt-1 ${expand ? "ml-3" : "ml-0"} space-y-1 border-l pl-3 transition-all duration-300`}
                      >
                        {item.subMenu?.map((subItem, j) => {
                          const SubIcon = subItem.icon;
                          const isActive = pathname === subItem.to;
                          return (
                            <Link
                              href={subItem.to}
                              key={j}
                              className={`text-base-content/70 hover:bg-base-300/80 hover:text-accent flex w-full items-center transition-all ${
                                expand ? "gap-2" : "gap-0"
                              } rounded-lg px-2 py-2 text-sm font-medium ${
                                isActive ? "bg-base-300 text-accent" : ""
                              }`}
                            >
                              <SubIcon className="h-4 w-4 shrink-0" />
                              <p
                                className={`text-xs transition-all duration-300 ${
                                  expand
                                    ? "w-30 translate-x-0 opacity-100"
                                    : "w-0 -translate-x-4 overflow-hidden opacity-0"
                                }`}
                              >
                                {subItem.label}
                              </p>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.to || "#"}
                    className={`text-base-content hover:bg-base-300/80 hover:text-accent flex w-full items-center transition-all ${expand ? "gap-3" : "gap-0"} rounded-xl border border-transparent px-3 py-2.5 font-medium`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <p
                      className={`text-sm transition-all duration-300 ${
                        expand
                          ? "w-30 translate-x-0 opacity-100"
                          : "w-0 -translate-x-4 overflow-hidden opacity-0"
                      }`}
                    >
                      {item.label}
                    </p>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-base-300 border-t p-3">
          <div
            onClick={() => setExpand(!expand)}
            className={`hidden cursor-pointer ${expand ? "justify-end" : "justify-center"} px-3 py-3 transition-all duration-300 lg:flex`}
          >
            <SquareArrowRightExit
              className={`${expand ? "rotate-180" : "rotate-0"} h-4 w-4 transition-transform duration-300`}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
