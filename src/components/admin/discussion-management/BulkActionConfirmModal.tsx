import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface BulkActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "publish" | "ban" | "delete";
  count: number;
  onConfirm: () => void;
}

export function BulkActionConfirmModal({
  isOpen,
  onClose,
  action,
  count,
  onConfirm,
}: BulkActionConfirmModalProps) {
  const actionLabels = {
    publish: "Publish Comments",
    ban: "Ban Comments",
    delete: "Delete Comments",
  };

  const actionDescriptions = {
    publish: 'change the status of all selected comments to "Published"',
    ban: 'change the status of all selected comments to "Banned"',
    delete: 'change the status of all selected comments to "Deleted"',
  };

  const actionColors = {
    publish: "text-success",
    ban: "text-warning",
    delete: "text-danger",
  };

  const actionWarnings = {
    publish: null,
    ban: "Comment authors will be notified of this action.",
    delete: "Comments will be permanently deleted after 30 days.",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${action === "delete" ? "bg-danger/15" : action === "ban" ? "bg-warning/15" : "bg-success/15"}`}>
            <AlertTriangle className={`h-5 w-5 ${action === "delete" ? "text-danger" : action === "ban" ? "text-warning" : "text-success"}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-base-content">
              {actionLabels[action]}
            </h2>
            <p className="mt-2 text-sm text-base-content/70">
              Are you sure you want to{" "}
              <span className={`font-medium ${actionColors[action]}`}>
                {actionDescriptions[action]}
              </span>
              ?
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-base-300/50 p-3">
          <div className="text-sm text-base-content">
            <span className="font-semibold">{count}</span> comment{count !== 1 ? "s" : ""} selected
          </div>
          {actionWarnings[action] && (
            <div className="mt-1 text-xs text-base-content/60">
              {actionWarnings[action]}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-info/10 border border-info/20 p-3 text-sm text-base-content">
          This action will be logged in the audit trail.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={action === "delete" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            Confirm Action
          </Button>
        </div>
      </div>
    </Modal>
  );
}
