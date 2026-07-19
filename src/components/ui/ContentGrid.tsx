"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LayoutGrid } from "lucide-react";

export type SortKey = "popular" | "latest";

export default function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const options: { value: SortKey; label: string }[] = [
    { value: "popular", label: "Popular" },
    { value: "latest", label: "Latest" },
  ];
  const current = options.find((o) => o.value === value)!;

  return (
    <div ref={ref} className="relative flex items-center gap-1 px-2 py-0.5">
      <span className="text-base-content text-sm">Sort by</span>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-base-content hover:bg-base-300 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold"
      >
        {current.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-base-content/20 bg-base-100 absolute top-full right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border py-1 shadow-xl">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`hover:bg-base-300 flex w-full items-center justify-between px-4 py-2 text-sm ${
                value === o.value
                  ? "text-base-content font-semibold"
                  : "text-base-content/70"
              }`}
            >
              <span>{o.label}</span>
              {value === o.value && <LayoutGrid className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
