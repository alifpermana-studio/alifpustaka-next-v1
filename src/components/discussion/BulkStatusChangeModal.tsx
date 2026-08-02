import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { DiscussionStatus } from "@/types/discussion";

interface BulkStatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (status: DiscussionStatus) => void;
}

export function BulkStatusChangeModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}: BulkStatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<DiscussionStatus>("published");

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "published", label: "Published" },
    { value: "deleted", label: "Deleted" },
  ];

  const statusDescriptions: Record<DiscussionStatus, string> = {
    pending: "Comments will be marked as pending review",
    published: "Comments will be visible to everyone",
    banned: "Comments will be hidden (admin only)",
    deleted: "Comments will be soft deleted (30-day grace period)",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-warning/15 p-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-base-content">
              Change Comment Status
            </h2>
            <p className="mt-2 text-sm text-base-content/70">
              Select the new status for all selected comments.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-base-content mb-1.5 block">
            New Status
          </label>
          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as DiscussionStatus)}
            options={statusOptions}
            className="w-full"
          />
          <p className="mt-1 text-xs text-base-content/60">
            {statusDescriptions[selectedStatus]}
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-base-300/50 p-3">
          <div className="text-sm text-base-content">
            <span className="font-semibold">{selectedCount}</span> comment{selectedCount !== 1 ? "s" : ""} selected
          </div>
        </div>

        {selectedStatus === "deleted" && (
          <div className="mt-4 rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-base-content">
            Comments will be permanently deleted after 30 days
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={selectedStatus === "deleted" ? "danger" : "primary"}
            onClick={() => {
              onConfirm(selectedStatus);
            }}
          >
            {selectedStatus === "deleted" ? "Delete Comments" : "Change Status"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
