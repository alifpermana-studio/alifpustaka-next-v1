import { Discussion } from "@/types/discussion";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: Discussion[];
  currentUserId?: string;
  loading: boolean;
}

export function CommentList({ comments, currentUserId, loading }: CommentListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <span className="loading loading-spinner loading-md"></span>
        <p className="text-base-content/70 mt-2">Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/70">
          No comments yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwn={currentUserId === comment.userId}
        />
      ))}
    </div>
  );
}
