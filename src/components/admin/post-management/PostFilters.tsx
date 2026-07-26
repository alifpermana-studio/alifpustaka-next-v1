import { PostStatus } from "apus-post";
import { Select } from "@/components/ui/Select";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface PostFilterState {
  search: string;
  status: PostStatus | "";
}

interface PostFiltersProps {
  filter: PostFilterState;
  onFilterChange: (filter: PostFilterState) => void;
  totalPosts: number;
}

export function PostFilters({
  filter,
  onFilterChange,
  totalPosts,
}: PostFiltersProps) {
  const [searchInput, setSearchInput] = useState(filter.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filter, search: searchInput });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "drafted", label: "Drafted" },
    { value: "submitted", label: "Submitted" },
    { value: "published", label: "Published" },
    { value: "deleted", label: "Deleted" },
  ];

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

        <div className="flex gap-3">
          <Select
            value={filter.status}
            onChange={(value) =>
              onFilterChange({ ...filter, status: value as PostStatus | "" })
            }
            options={statusOptions}
            className="w-40"
          />
        </div>
      </div>

      <div className="text-base-content/70 text-sm">
        {totalPosts} post{totalPosts !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
