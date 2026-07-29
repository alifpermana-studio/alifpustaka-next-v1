import { DiscussionListItem } from "@/types/discussion";

interface DeleteDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussion: DiscussionListItem | null;
  onConfirm: () => Promise<void>;
}

export function DeleteDiscussionModal({
  isOpen,
  onClose,
  discussion,
  onConfirm,
}: DeleteDiscussionModalProps) {
  if (!isOpen || !discussion) return null;

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-error">Delete Comment</h3>
        <p className="py-4">
          Are you sure you want to delete this comment?
        </p>

        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-base-content/80">
            {truncateContent(discussion.content)}
          </p>
        </div>

        <div className="alert alert-warning">
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
          <div>
            <div className="font-bold">Important</div>
            <div className="text-sm">
              This comment will be hidden from public view immediately. It will be
              permanently deleted after 30 days.
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            Delete Comment
          </button>
        </div>
      </div>
    </div>
  );
}
