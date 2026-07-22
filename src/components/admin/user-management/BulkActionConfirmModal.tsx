import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface BulkActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "activate" | "deactivate" | "ban";
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
    activate: "Activate Users",
    deactivate: "Deactivate Users",
    ban: "Ban Users",
  };

  const actionDescriptions = {
    activate: 'change the status of all selected users to "Active"',
    deactivate: 'change the status of all selected users to "Inactive"',
    ban: 'change the status of all selected users to "Banned"',
  };

  const actionColors = {
    activate: "text-success",
    deactivate: "text-warning",
    ban: "text-danger",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${action === "ban" ? "bg-danger/15" : "bg-warning/15"}`}>
            <AlertTriangle className={`h-5 w-5 ${action === "ban" ? "text-danger" : "text-warning"}`} />
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
            <span className="font-semibold">{count}</span> user{count !== 1 ? "s" : ""} selected
          </div>
          <div className="mt-1 text-xs text-base-content/60">
            Users you don't have permission to manage will be skipped.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={action === "ban" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
            }}
          >
            Confirm Action
          </Button>
        </div>
      </div>
    </Modal>
  );
}
