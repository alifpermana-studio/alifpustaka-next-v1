import { DiscussionStatus, DiscussionSourceType } from "@/types/discussion";

interface DiscussionFiltersProps {
  filter: {
    search: string;
    status: DiscussionStatus | "";
    sourceType: DiscussionSourceType | "";
  };
  onFilterChange: (filter: any) => void;
  totalDiscussions: number;
  loading?: boolean;
  onRefresh?: () => void;
}

export function DiscussionFilters({
  filter,
  onFilterChange,
  totalDiscussions,
  loading = false,
  onRefresh,
}: DiscussionFiltersProps) {
  return (
    <div className="bg-base-200 p-4 rounded-lg mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search comments..."
            className="input input-bordered w-full"
            value={filter.search}
            onChange={(e) =>
              onFilterChange({ ...filter, search: e.target.value })
            }
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            className="select select-bordered"
            value={filter.status}
            onChange={(e) =>
              onFilterChange({ ...filter, status: e.target.value })
            }
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="banned">Banned</option>
            <option value="deleted">Deleted</option>
          </select>

          <select
            className="select select-bordered"
            value={filter.sourceType}
            onChange={(e) =>
              onFilterChange({ ...filter, sourceType: e.target.value })
            }
          >
            <option value="">All Sources</option>
            <option value="blog_post">Blog Posts</option>
            <option value="product_review">Product Reviews</option>
            <option value="product_qa">Product Q&A</option>
          </select>

          {onRefresh && (
            <button
              className="btn btn-primary"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-base-content/70">
        Total: {totalDiscussions} comment(s)
      </div>
    </div>
  );
}
