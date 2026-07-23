import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { PostStatus } from "apus-post";

interface BulkStatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (status: PostStatus) => void;
}

export function BulkStatusChangeModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}: BulkStatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<PostStatus>("published");

  const statusOptions = [
    { value: "published", label: "Published" },
    { value: "submitted", label: "Submitted" },
    { value: "drafted", label: "Drafted" },
    { value: "deleted", label: "Deleted" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-warning/15 p-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-base-content">
              Change Post Status
            </h2>
            <p className="mt-2 text-sm text-base-content/70">
              Select the new status for all selected posts.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-base-content mb-1.5 block">
            New Status
          </label>
          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as PostStatus)}
            options={statusOptions}
            className="w-full"
          />
        </div>

        <div className="mt-4 rounded-lg bg-base-300/50 p-3">
          <div className="text-sm text-base-content">
            <span className="font-semibold">{selectedCount}</span> post{selectedCount !== 1 ? "s" : ""} selected
          </div>
        </div>

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
            {selectedStatus === "deleted" ? "Delete Posts" : "Change Status"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
