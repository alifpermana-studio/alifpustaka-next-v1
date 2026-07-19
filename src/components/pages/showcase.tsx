"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import Header, { SearchBar } from "@/components/showcase/FilterHeader";
import Sidebar, {
  emptyFilters,
  type FilterState,
} from "@/components/showcase/FilterSidebar";
import ContentCard from "@/components/ui/ContentCard";
import SortDropdown, { type SortKey } from "@/components/ui/ContentGrid";
import { ITEMS, type Category } from "@/data/content";
import Navbar from "../layout/Navbar";

export default function Showcase() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("popular");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("Graphic Templates");

  // Always-on showcase category — mirrors Envato's "Graphic Templates" landing
  const [showcase, setShowcase] = useState<Category>("Websites");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = ITEMS.filter((it) => {
      // Showcase is the primary category context (the page the user is on)
      const inShowcase = it.category === showcase;

      // If user picked categories in the sidebar, those OR with the showcase
      const matchesCategory =
        filters.categories.length === 0
          ? inShowcase
          : filters.categories.includes(it.category);

      const matchesColor =
        filters.colorSpace.length === 0 ||
        it.colorSpace.some((c) => filters.colorSpace.includes(c));

      const matchesOrientation =
        filters.orientation.length === 0 ||
        filters.orientation.includes(it.orientation);

      const matchesApp =
        filters.applications.length === 0 ||
        it.applications.some((a) => filters.applications.includes(a));

      const matchesProps =
        filters.properties.length === 0 ||
        filters.properties.every((p) => it.properties.includes(p));

      const matchesQuery =
        q.length === 0 ||
        it.title.toLowerCase().includes(q) ||
        it.author.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q);

      return (
        matchesCategory &&
        matchesColor &&
        matchesOrientation &&
        matchesApp &&
        matchesProps &&
        matchesQuery
      );
    });

    list = [...list].sort((a, b) =>
      sort === "popular"
        ? b.popularity - a.popularity
        : new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    );
    return list;
  }, [filters, sort, query, showcase]);

  const activeChips: { label: string; onRemove: () => void }[] = [];
  filters.categories.forEach((c) =>
    activeChips.push({
      label: c,
      onRemove: () =>
        setFilters({
          ...filters,
          categories: filters.categories.filter((x) => x !== c),
        }),
    }),
  );
  filters.colorSpace.forEach((c) =>
    activeChips.push({
      label: c,
      onRemove: () =>
        setFilters({
          ...filters,
          colorSpace: filters.colorSpace.filter((x) => x !== c),
        }),
    }),
  );
  filters.orientation.forEach((o) =>
    activeChips.push({
      label: o,
      onRemove: () =>
        setFilters({
          ...filters,
          orientation: filters.orientation.filter((x) => x !== o),
        }),
    }),
  );
  filters.applications.forEach((a) =>
    activeChips.push({
      label: a,
      onRemove: () =>
        setFilters({
          ...filters,
          applications: filters.applications.filter((x) => x !== a),
        }),
    }),
  );
  filters.properties.forEach((p) =>
    activeChips.push({
      label: p,
      onRemove: () =>
        setFilters({
          ...filters,
          properties: filters.properties.filter((x) => x !== p),
        }),
    }),
  );

  return (
    <div className={`min-h-screen`}>
      <Navbar />

      {/* Top banner: search */}
      <div className="bg-base-100 relative pt-24 pb-10">
        <div className="relative z-10 mx-auto max-w-360 px-6">
          <SearchBar
            query={query}
            onQuery={setQuery}
            scope={scope}
            onScope={setScope}
          />

          {/* Category quick-switch (mirrors the envato strip below the search) */}
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            {(
              [
                "Websites",
                "Print Templates",
                "Social Media",
                "UX and UI Kits",
                "Product Mockups",
                "Infographics",
                "Logos",
              ] as Category[]
            ).map((c) => (
              <button
                key={c}
                onClick={() => setShowcase(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  showcase === c
                    ? "bg-secondary text-secondary-content border-2 border-amber-50"
                    : "bg-accent/80 text-accent-content hover:bg-accent/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-3xl">
            <h1 className="text-base-content text-2xl font-bold md:text-3xl">
              {scope} — {showcase}
            </h1>
            <p className="text-base-content/70 mt-2 text-sm leading-relaxed md:text-base">
              Discover unlimited {scope.toLowerCase()} for every project. Filter
              by category, color space, orientation, and supported applications
              — then sort by popularity or latest uploads.
            </p>
          </div>
        </div>
        {/* ambient blue glows */}
        <div
          className="bg-info/65 pointer-events-none absolute -top-80 -left-80 h-136 w-xl rounded-full blur-[220px]"
          style={{ animation: "drift 16s ease-in-out infinite" }}
        />
        <div className="absolute right-0 bottom-0 h-full w-full overflow-hidden">
          <div
            className="bg-info/40 pointer-events-none absolute -right-80 -bottom-84 h-144 w-xl rounded-full blur-[230px]"
            style={{ animation: "drift 20s ease-in-out infinite reverse" }}
          />
        </div>
        {/* grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(circle at 30% 40%, black, transparent 95%)",
            animation: "grid-pan 30s linear infinite",
          }}
        />
      </div>

      {/* Main content */}
      <div className="bg-base-100 mx-auto max-w-360 px-6 py-8">
        <div className="flex gap-8">
          <Sidebar
            filters={filters}
            setFilters={setFilters}
            visible={sidebarVisible}
            onHide={() => setSidebarVisible(false)}
          />

          <main
            className={`min-w-0 flex-1 ${sidebarVisible ? "hidden" : "block"} sm:block`}
          >
            {/* Toolbar */}
            <div className="mb-5 flex items-center justify-between gap-1">
              <div className="flex items-center gap-3">
                {!sidebarVisible && (
                  <button
                    onClick={() => setSidebarVisible(true)}
                    className="border-base-content/20 text-base-content hover:bg-base-300 hover:text-base-content flex items-end gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Show Filters
                  </button>
                )}
                <p className="text-base-content px-3 py-1.5 text-center text-sm">
                  <span className="text-base-content font-semibold">
                    {filtered.length}
                  </span>{" "}
                  result{filtered.length === 1 ? "" : "s"}
                </p>
              </div>
              <SortDropdown value={sort} onChange={setSort} />
            </div>

            {/* Active filter chips */}
            <AnimatePresence initial={false}>
              {activeChips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex flex-wrap items-center gap-2"
                >
                  <span className="text-base-content text-xs font-semibold tracking-wider uppercase">
                    Active filters
                  </span>
                  {activeChips.map((chip, i) => (
                    <button
                      key={`${chip.label}-${i}`}
                      onClick={chip.onRemove}
                      className="group bg-base-200 text-base-content hover:border-base-content hover:bg-base-300 border-base-content/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                    >
                      {chip.label}
                      <X className="text-base-content group-hover:text-base-content h-3 w-3" />
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters(emptyFilters)}
                    className="text-base-content text-xs font-medium underline-offset-2 hover:underline"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="border-base-content/40 bg-base-200 grid place-items-center rounded-2xl border border-dashed py-24 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-white shadow ring-1 ring-neutral-200">
                    <SlidersHorizontal className="h-5 w-5 text-neutral-500" />
                  </div>
                  <h3 className="text-base-content text-lg font-semibold">
                    No matching templates
                  </h3>
                  <p className="text-base-content/70 mt-1 text-sm">
                    Try removing some filters, switching the showcase category,
                    or searching for something else.
                  </p>
                  <button
                    onClick={() => {
                      setFilters(emptyFilters);
                      setQuery("");
                    }}
                    className="bg-accent hover:bg-accent/90 text-accent-content mt-4 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <ContentCard item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      <footer className="mt-12 border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-360 flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-neutral-500 md:flex-row">
          <p>Envato-style filter showcase — built with React + Tailwind v4.</p>
          <p>Mock data for demonstration purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
