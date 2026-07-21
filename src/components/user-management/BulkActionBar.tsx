import { Button } from "@/components/ui/Button";
import { X, CheckCircle, XCircle, Ban } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: "activate" | "deactivate" | "ban") => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
}: BulkActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="rounded-xl border border-base-300 bg-base-200 p-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-base-content">
            {selectedCount} user{selectedCount !== 1 ? "s" : ""} selected
          </div>

          <div className="h-6 w-px bg-base-300" />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onBulkAction("activate")}
            >
              <CheckCircle className="h-4 w-4" />
              Activate
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onBulkAction("deactivate")}
            >
              <XCircle className="h-4 w-4" />
              Deactivate
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => onBulkAction("ban")}
            >
              <Ban className="h-4 w-4" />
              Ban
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
