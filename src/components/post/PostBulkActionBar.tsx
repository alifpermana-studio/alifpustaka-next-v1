import { Button } from "@/components/ui/Button";
import { X, FileEdit, Trash2, Tags } from "lucide-react";

interface PostBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: "status" | "delete" | "tags") => void;
}

export function PostBulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
}: PostBulkActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="rounded-xl border border-base-300 bg-base-200 p-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-base-content">
            {selectedCount} post{selectedCount !== 1 ? "s" : ""} selected
          </div>

          <div className="h-6 w-px bg-base-300" />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onBulkAction("status")}
            >
              <FileEdit className="h-4 w-4" />
              Change Status
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onBulkAction("tags")}
            >
              <Tags className="h-4 w-4" />
              Manage Tags
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => onBulkAction("delete")}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          <div className="h-6 w-px bg-base-300" />

          <button
            onClick={onClearSelection}
            className="rounded-lg p-2 text-base-content/70 transition-colors hover:bg-base-300 hover:text-base-content"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
