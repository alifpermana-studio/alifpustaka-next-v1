import { useState } from "react";
import { DiscussionListItem } from "@/types/discussion";

interface EditDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussion: DiscussionListItem | null;
  onConfirm: (content: string) => Promise<void>;
}

export function EditDiscussionModal({
  isOpen,
  onClose,
  discussion,
  onConfirm,
}: EditDiscussionModalProps) {
  const [content, setContent] = useState(discussion?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(content.trim());
      onClose();
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent(discussion?.content || "");
      onClose();
    }
  };

  if (!isOpen || !discussion) return null;

  const remainingChars = 5000 - content.length;
  const isValid = content.trim().length > 0 && content.length <= 5000;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Edit Comment</h3>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Content</span>
            <span className={`label-text-alt ${remainingChars < 0 ? "text-error" : ""}`}>
              {remainingChars} characters remaining
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered h-40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your comment..."
            disabled={isSubmitting}
          />
        </div>

        {discussion.editCount > 0 && (
          <div className="alert alert-info mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>This comment has been edited {discussion.editCount} time(s)</span>
          </div>
        )}

        <div className="alert alert-warning mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>You can only edit comments within 30 minutes of posting</span>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
