import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface GalleryFilterState {
  search: string;
}

interface GalleryFiltersProps {
  filter: GalleryFilterState;
  onFilterChange: (filter: GalleryFilterState) => void;
  totalGalleries: number;
}

export function GalleryFilters({
  filter,
  onFilterChange,
  totalGalleries,
}: GalleryFiltersProps) {
  const [searchInput, setSearchInput] = useState(filter.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filter, search: searchInput });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-base-content/50 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border-base-300 bg-base-200 text-base-content focus:border-accent focus:ring-accent h-10 w-full rounded-xl border pr-4 pl-10 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"
          />
        </div>
      </div>

      <div className="text-base-content/70 text-sm">
        {totalGalleries} gallery item{totalGalleries !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
