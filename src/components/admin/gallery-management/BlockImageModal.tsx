import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";

interface BlockImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  imageTitle: string;
  authorName: string;
  isBlocking: boolean;
}

export function BlockImageModal({
  isOpen,
  onClose,
  onConfirm,
  imageTitle,
  authorName,
  isBlocking,
}: BlockImageModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-base-content mb-4">
          Block Image?
        </h2>
        
        <p className="text-base-content/70 mb-4">
          Are you sure you want to block <strong>{imageTitle}</strong>?
        </p>
        
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-base-content/70">
            This will:
          </p>
          <ul className="list-disc list-inside text-sm text-base-content/70 mt-2 space-y-1">
            <li>Make this image private</li>
            <li>Notify <strong>{authorName}</strong></li>
            <li>Remove it from public gallery</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isBlocking}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isBlocking}
          >
            {isBlocking ? "Blocking..." : "Block Image"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
