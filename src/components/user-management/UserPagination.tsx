import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UserPaginationProps {
  skip: number;
  limit: number;
  total: number;
  onPageChange: (skip: number) => void;
}

export function UserPagination({ skip, limit, total, onPageChange }: UserPaginationProps) {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNext = skip + limit < total;
  const hasPrev = skip > 0;

  const startIndex = total === 0 ? 0 : skip + 1;
  const endIndex = Math.min(skip + limit, total);

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="text-sm text-base-content/70">
        Showing {startIndex}-{endIndex} of {total}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(skip - limit)}
          disabled={!hasPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-base-content">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(skip + limit)}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
