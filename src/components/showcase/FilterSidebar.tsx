"use client";

import { useState } from "react";
import { Plus, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  CATEGORIES,
  COLOR_SPACES,
  ORIENTATIONS,
  APPLICATIONS,
  PROPERTIES,
  type Category,
  type ColorSpace,
  type Orientation,
  type Application,
  type Property,
} from "@/data/content";

export interface FilterState {
  categories: Category[];
  colorSpace: ColorSpace[];
  orientation: Orientation[];
  applications: Application[];
  properties: Property[];
}

export const emptyFilters: FilterState = {
  categories: [],
  colorSpace: [],
  orientation: [],
  applications: [],
  properties: [],
};

const extraApps: Application[] = [
  "Adobe XD",
  "Affinity",
  "Figma",
  "Sketch",
  "Canva",
];

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="text-base-content hover:text-base-content/80 flex cursor-pointer items-center gap-3 py-1.5 text-sm">
      <span
        className={`grid h-4 w-4 place-items-center rounded-sm border transition ${
          checked
            ? "border-base-content bg-base-200 text-base-content"
            : "border-base-content/20 bg-base-300/60"
        }`}
        onClick={(e) => {
          e.preventDefault();
          onChange();
        }}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
            <path
              d="M2.5 6.2l2.4 2.4 4.6-4.6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span>{label}</span>
    </label>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-base-content/80 border-b py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-base-content text-sm font-semibold">{title}</span>
        <ChevronDown
          className={`text-base-content/90 h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

export default function Sidebar({
  filters,
  setFilters,
  visible,
  onHide,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  visible: boolean;
  onHide: () => void;
}) {
  const toggle = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K][number],
  ) => {
    const arr = filters[key] as readonly string[];
    const next = arr.includes(value)
      ? (arr as string[]).filter((v) => v !== value)
      : [...(arr as string[]), value];
    setFilters({ ...filters, [key]: next });
  };

  const clearAll = () => setFilters(emptyFilters);

  const totalSelected =
    filters.categories.length +
    filters.colorSpace.length +
    filters.orientation.length +
    filters.applications.length +
    filters.properties.length;

  if (!visible) return null;

  return (
    <aside className="w-full sm:w-40 md:w-48 lg:w-64 lg:shrink-0">
      <div className="sticky top-24 space-y-1">
        <button
          onClick={onHide}
          className="text-base-content hover:bg-base-300 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Hide Filters
        </button>

        <button
          onClick={clearAll}
          disabled={totalSelected === 0}
          className="text-base-content hover:bg-base-300 flex items-center gap-2 rounded-lg px-2 py-2 text-sm disabled:opacity-40"
        >
          <X className="h-4 w-4" />
          Clear all
        </button>

        <Section title="Categories">
          <div className="space-y-0.5">
            {CATEGORIES.map((c) => (
              <Checkbox
                key={c}
                label={c}
                checked={filters.categories.includes(c)}
                onChange={() => toggle("categories", c)}
              />
            ))}
          </div>
        </Section>

        <Section title="Color Space">
          <div className="space-y-0.5">
            {COLOR_SPACES.map((c) => (
              <Checkbox
                key={c}
                label={c}
                checked={filters.colorSpace.includes(c)}
                onChange={() => toggle("colorSpace", c)}
              />
            ))}
          </div>
        </Section>

        <Section title="Orientation">
          <div className="space-y-0.5">
            {ORIENTATIONS.map((o) => (
              <Checkbox
                key={o}
                label={o}
                checked={filters.orientation.includes(o)}
                onChange={() => toggle("orientation", o)}
              />
            ))}
          </div>
        </Section>

        <Section title="Applications Supported">
          <div className="space-y-0.5">
            {APPLICATIONS.slice(0, 3).map((a) => (
              <Checkbox
                key={a}
                label={a}
                checked={filters.applications.includes(a)}
                onChange={() => toggle("applications", a)}
              />
            ))}
            {extraApps.map((a) => (
              <Checkbox
                key={a}
                label={a}
                checked={filters.applications.includes(a)}
                onChange={() => toggle("applications", a)}
              />
            ))}
          </div>
          <button className="text-base-content hover:text-base-content/80 mt-2 flex items-center gap-1 text-sm font-medium">
            <Plus className="h-3.5 w-3.5" />
            Show More
          </button>
        </Section>

        <Section title="Properties">
          <div className="space-y-0.5">
            {PROPERTIES.map((p) => (
              <Checkbox
                key={p}
                label={p}
                checked={filters.properties.includes(p)}
                onChange={() => toggle("properties", p)}
              />
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
}
