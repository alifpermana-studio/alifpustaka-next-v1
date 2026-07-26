import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface BulkBlockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  onConfirm: (footnote: string) => void;
  isBlocking: boolean;
}

export function BulkBlockConfirmModal({
  isOpen,
  onClose,
  count,
  onConfirm,
  isBlocking,
}: BulkBlockConfirmModalProps) {
  const [footnote, setFootnote] = useState("");

  const handleConfirm = () => {
    if (footnote.trim()) {
      onConfirm(footnote.trim());
    }
  };

  const handleClose = () => {
    setFootnote("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full p-2 bg-danger/15">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-base-content">
              Block Multiple Images?
            </h2>
            <p className="mt-2 text-sm text-base-content/70">
              You are about to block{" "}
              <span className="font-medium text-danger">{count} image{count !== 1 ? "s" : ""}</span>.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-base-content mb-2">
            Admin Notes (Required)
          </label>
          <textarea
            value={footnote}
            onChange={(e) => setFootnote(e.target.value)}
            maxLength={200}
            placeholder="Reason for blocking these images..."
            rows={4}
            disabled={isBlocking}
            className="border-base-300 bg-base-200 text-base-content focus:border-accent focus:ring-accent w-full rounded-lg border px-4 py-2 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none resize-none disabled:opacity-50"
          />
          <div className="text-base-content/50 text-xs mt-1 text-right">
            {footnote.length}/200 characters
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-warning/10 border border-warning/30 p-3">
          <div className="text-sm text-base-content/70">
            <p className="font-medium text-base-content mb-2">This will:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Make all selected images private</li>
              <li>Move files to private storage</li>
              <li>Notify all owners with your reason</li>
              <li>Remove images from public gallery</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isBlocking}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!footnote.trim() || isBlocking}
          >
            {isBlocking ? "Blocking..." : "Block Images"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
