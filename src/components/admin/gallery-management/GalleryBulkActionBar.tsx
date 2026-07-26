import { Button } from "@/components/ui/Button";
import { X, Ban } from "lucide-react";

interface GalleryBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkBlock: () => void;
}

export function GalleryBulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkBlock,
}: GalleryBulkActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="rounded-xl border border-base-300 bg-base-200 p-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-base-content">
            {selectedCount} image{selectedCount !== 1 ? "s" : ""} selected
          </div>

          <div className="h-6 w-px bg-base-300" />

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={onBulkBlock}
            >
              <Ban className="h-4 w-4" />
              Block Images
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
