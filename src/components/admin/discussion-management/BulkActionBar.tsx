import { Button } from "@/components/ui/Button";
import { CheckCircle, Ban, Trash2, X } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: "publish" | "ban" | "delete") => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
}: BulkActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="border-base-300 bg-base-200 rounded-xl border p-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="text-base-content text-sm font-medium">
            {selectedCount} comment{selectedCount !== 1 ? "s" : ""} selected
          </div>

          <div className="bg-base-300 h-6 w-px" />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="hover:bg-base-300 cursor-pointer"
              size="sm"
              onClick={() => onBulkAction("publish")}
            >
              <CheckCircle className="h-4 w-4" />
              Publish
            </Button>

            <Button
              variant="secondary"
              className="hover:bg-base-300 cursor-pointer"
              size="sm"
              onClick={() => onBulkAction("ban")}
            >
              <Ban className="h-4 w-4" />
              Ban
            </Button>

            <Button
              variant="danger"
              className="hover:bg-base-300 cursor-pointer"
              size="sm"
              onClick={() => onBulkAction("delete")}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          <div className="bg-base-300 h-6 w-px" />

          <button
            onClick={onClearSelection}
            className="text-base-content/70 hover:bg-base-300 hover:text-base-content rounded-lg p-2 transition-colors"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
