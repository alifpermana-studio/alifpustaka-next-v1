import { Select } from "@/components/ui/Select";
import { DiscussionStatus, DiscussionSourceType } from "@/types/discussion";
import { Search } from "lucide-react";

interface DiscussionFiltersProps {
  filter: {
    search: string;
    status: DiscussionStatus | "";
    sourceType: DiscussionSourceType | "";
  };
  onFilterChange: (filter: any) => void;
  totalDiscussions: number;
}

export function DiscussionFilters({
  filter,
  onFilterChange,
  totalDiscussions,
}: DiscussionFiltersProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-base-content/50 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={filter.search}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border-base-300 bg-base-200 text-base-content focus:border-accent focus:ring-accent h-10 w-full rounded-xl border pr-4 pl-10 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <Select
            value={filter.status}
            onChange={(value) =>
              onFilterChange({
                ...filter,
                status: value as DiscussionStatus | "",
              })
            }
            options={[
              { label: "Pending", value: "pending" },
              { label: "Published", value: "published" },
              { label: "Banned", value: "banned" },
              { label: "Deleted", value: "deleted" },
            ]}

            className="w-40"
          />
        </div>
      </div>

      <div className="text-base-content/70 text-sm">
        {totalDiscussions} comment{totalDiscussions !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
