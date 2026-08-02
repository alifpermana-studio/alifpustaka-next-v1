import { DiscussionListItem } from "@/types/discussion";
import { Checkbox } from "@/components/ui/Checkbox";

interface DiscussionTableRowProps {
  discussion: DiscussionListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (discussion: DiscussionListItem) => void;
  onDelete: (discussion: DiscussionListItem) => void;
}

export function DiscussionTableRow({
  discussion,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: DiscussionTableRowProps) {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: "badge-warning",
      published: "badge-success",
      banned: "badge-error",
      deleted: "badge-ghost",
    };
    return badges[status] || "badge-ghost";
  };

  const getSourceTypeBadge = (sourceType: string) => {
    const badges: Record<string, string> = {
      blog_post: "badge-primary",
      product_review: "badge-secondary",
      product_qa: "badge-accent",
    };
    return badges[sourceType] || "badge-ghost";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const isDeleted = discussion.status === "deleted";

  return (
    <tr className="hover">
      <td>
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(discussion.id)}
          disabled={isDeleted}
        />
      </td>
      <td>
        <div className="flex flex-col gap-2">
          <p className="text-sm">{truncateContent(discussion.content, 150)}</p>
          {discussion.editCount > 0 && (
            <span className="text-xs text-base-content/60">
              Edited {discussion.editCount} time(s)
              {discussion.editedAt && ` - Last: ${formatDate(discussion.editedAt)}`}
            </span>
          )}
        </div>
      </td>
      <td>
        <div className="flex flex-col gap-1">
          <span className={`badge ${getStatusBadge(discussion.status)}`}>
            {discussion.status}
          </span>
          {discussion.deletedAt && (
            <span className="text-xs text-base-content/60">
              Deleted: {formatDate(discussion.deletedAt)}
            </span>
          )}
        </div>
      </td>
      <td>
        <div className="flex flex-col gap-1">
          <span className={`badge ${getSourceTypeBadge(discussion.sourceType)}`}>
            {discussion.sourceType.replace("_", " ")}
          </span>
          {discussion.sourceTitle && (
            <span className="text-xs text-base-content/70">
              {truncateContent(discussion.sourceTitle, 30)}
            </span>
          )}
        </div>
      </td>
      <td>
        <span className="badge badge-outline">{discussion.replyCount}</span>
      </td>
      <td>
        <span className="text-sm text-base-content/70">
          {formatDate(discussion.createdAt)}
        </span>
      </td>
      <td>
        <div className="flex gap-2">
          {discussion.canEdit && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => onEdit(discussion)}
            >
              Edit
            </button>
          )}
          {discussion.canDelete && (
            <button
              className="btn btn-sm btn-ghost text-error"
              onClick={() => onDelete(discussion)}
            >
              Delete
            </button>
          )}
          {!discussion.canEdit && !discussion.canDelete && (
            <span className="text-xs text-base-content/50">No actions</span>
          )}
        </div>
      </td>
    </tr>
  );
}
