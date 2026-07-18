import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, User } from "lucide-react";
import { NAV_LINKS } from "@/data/content";

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-360 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
              <path
                d="M4 6c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2h-9l4 8c.3.6 0 1.3-.6 1.6l-3 1.5c-.6.3-1.3 0-1.6-.6L9 9H6c-1.1 0-2-.9-2-2V6z"
                fill="#82B440"
              />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-neutral-900">
              envato
            </span>
          </div>
        </div>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((label: any) => (
            <button
              key={label}
              onMouseEnter={() => setOpenMenu(label)}
              onMouseLeave={() => setOpenMenu(null)}
              className="group flex items-center gap-0.5 rounded-lg px-1 py-0 text-[0.7rem] font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              {label}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  openMenu === label ? "rotate-180" : ""
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button className="hidden text-sm font-medium text-neutral-700 hover:text-neutral-900 md:block">
            License
          </button>
          <button className="hidden text-sm font-medium text-neutral-700 hover:text-neutral-900 md:block">
            Enterprise
          </button>
          <button className="hidden text-sm font-medium text-neutral-700 hover:text-neutral-900 md:block">
            Pricing
          </button>
          <button className="rounded-md bg-[#82B440] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#73a335]">
            Get unlimited downloads
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-neutral-900 text-white">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function SearchBar({
  query,
  onQuery,
  scope,
  onScope,
}: {
  query: string;
  onQuery: (v: string) => void;
  scope: string;
  onScope: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const SCOPES = [
    "Graphic Templates",
    "Video Templates",
    "Stock Video",
    "Audio",
    "Photos",
    "Fonts",
    "3D",
    "Websites",
    "Presentations",
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when unmounting or when dropdown closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="ring-base-content/60 bg-base-100 mx-auto flex max-w-3xl items-center gap-3 rounded-full border px-5 py-2 shadow-sm ring-1">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-base-content flex items-end justify-center gap-2 text-sm font-medium"
        >
          {scope}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="absolute top-full left-0 z-30 mt-2 w-56 rounded-xl bg-[#0c1325] py-2 shadow-xl">
            {SCOPES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onScope(s);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-[#19264b] ${
                  scope === s
                    ? "font-bold text-emerald-500"
                    : "text-neutral-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-6 w-px bg-neutral-200" />
      <div className="flex flex-1 items-center gap-2">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search"
          className="w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}
