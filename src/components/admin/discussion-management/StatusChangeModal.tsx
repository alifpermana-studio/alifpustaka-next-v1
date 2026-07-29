import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { DiscussionStatus } from "@/types/discussion";
import { DiscussionListItem } from "@/types/discussion";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussion: DiscussionListItem | null;
  onConfirm: (status: DiscussionStatus) => Promise<void>;
}

export function StatusChangeModal({
  isOpen,
  onClose,
  discussion,
  onConfirm,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<DiscussionStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(selectedStatus);
      onClose();
    } catch (error) {
      console.error("Error changing status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!discussion) return null;

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const statusDescriptions: Record<DiscussionStatus, string> = {
    pending: "Comment is awaiting review",
    published: "Comment is visible to everyone",
    banned: "Comment violates community guidelines and is hidden",
    deleted: "Comment is marked as deleted and will be permanently removed in 30 days",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl p-6">
        <h2 className="text-xl font-bold text-base-content">Change Comment Status</h2>

        <div className="mt-4 space-y-4">
          <div>
            <div className="text-sm font-medium text-base-content">Comment</div>
            <div className="mt-2 rounded-lg bg-base-300/50 p-3 text-sm">
              <p className="text-base-content/80">
                {truncateContent(discussion.content, 200)}
              </p>
              <div className="mt-2 flex gap-2 items-center text-xs text-base-content/60">
                <span>By: {discussion.user?.name}</span>
                <span>•</span>
                <span>
                  Current Status: <span className="font-semibold">{discussion.status}</span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              New Status
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DiscussionStatus)}
              disabled={isSubmitting}
            >
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="banned">Banned</option>
              <option value="deleted">Deleted</option>
            </select>
            <p className="mt-1 text-xs text-base-content/60">
              {statusDescriptions[selectedStatus]}
            </p>
          </div>

          {selectedStatus === "banned" && (
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-base-content">
              The comment author will be notified of this action
            </div>
          )}

          {selectedStatus === "deleted" && (
            <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-base-content">
              This comment will be permanently deleted after 30 days
            </div>
          )}

          <div className="rounded-lg bg-info/10 border border-info/20 p-3 text-sm text-base-content">
            This action will be logged in the audit trail and the user will receive a notification.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || selectedStatus === discussion.status}
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
