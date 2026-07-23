import { Post } from "apus-post";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onConfirm: () => void;
}

export function DeletePostModal({
  isOpen,
  onClose,
  post,
  onConfirm,
}: DeletePostModalProps) {
  if (!post) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-danger/15 p-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-base-content">
              Delete Post
            </h2>
            <p className="mt-2 text-sm text-base-content/70">
              Are you sure you want to delete <span className="font-medium text-base-content">&ldquo;{post.title}&rdquo;</span>? This will mark the post as deleted.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-base-300/50 p-3">
          <div className="text-xs text-base-content/60">
            Deleted posts can be recovered later from the content management panel.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete Post
          </Button>
        </div>
      </div>
    </Modal>
  );
}
