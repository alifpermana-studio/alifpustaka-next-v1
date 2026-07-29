import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatRole } from "@/lib/utils/format-role";
import { DiscussionListItem } from "@/types/discussion";
import Image from "next/image";

interface DiscussionTableRowProps {
  discussion: DiscussionListItem & {
    user?: {
      id: string;
      name: string;
      username: string;
      image: string | null;
      role: string;
    };
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onStatusChange: (discussion: DiscussionListItem) => void;
}

const STATUS_BADGE_CONFIG: Record<string, { variant: "success" | "info" | "danger" | "warning"; label: string }> = {
  pending: { variant: "info", label: "Pending" },
  published: { variant: "success", label: "Published" },
  banned: { variant: "danger", label: "Banned" },
  deleted: { variant: "warning", label: "Deleted" },
};

const SOURCE_TYPE_BADGE_CONFIG: Record<string, { variant: "info" | "accent" | "neutral"; label: string }> = {
  blog_post: { variant: "info", label: "Blog Post" },
  product_review: { variant: "accent", label: "Product Review" },
  product_qa: { variant: "neutral", label: "Product Q&A" },
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function DiscussionTableRow({
  discussion,
  isSelected,
  onSelect,
  onStatusChange,
}: DiscussionTableRowProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const isDeleted = discussion.status === "deleted";

  return (
    <tr
      className={`border-b border-base-300 transition-colors hover:bg-base-300/30 ${
        isDeleted ? "opacity-60 bg-danger/5" : ""
      }`}
    >
      <td className="p-4">
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(discussion.id)}
          disabled={isDeleted}
        />
      </td>

      <td className="p-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm">{truncateContent(discussion.content, 150)}</p>
          {discussion.editCount > 0 && (
            <span className="text-base-content/60 text-xs">
              Edited {discussion.editCount} time(s)
            </span>
          )}
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-3">
          {discussion.user?.image ? (
            <Image
              src={discussion.user.image}
              alt={discussion.user.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-xs">
              {getInitials(discussion.user?.name || "Unknown")}
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{discussion.user?.name}</p>
            <p className="text-base-content/60 text-xs">
              @{discussion.user?.username}
            </p>
          </div>
        </div>
      </td>

      <td className="p-4">
        <Badge variant={STATUS_BADGE_CONFIG[discussion.status]?.variant || "warning"}>
          {STATUS_BADGE_CONFIG[discussion.status]?.label || discussion.status}
        </Badge>
      </td>

      <td className="p-4">
        <Badge variant={SOURCE_TYPE_BADGE_CONFIG[discussion.sourceType]?.variant || "accent"}>
          {SOURCE_TYPE_BADGE_CONFIG[discussion.sourceType]?.label || discussion.sourceType}
        </Badge>
      </td>

      <td className="p-4">
        <div className="text-sm text-base-content/70">{discussion.replyCount}</div>
      </td>

      <td className="p-4">
        <div className="text-sm text-base-content/70">
          {formatDate(discussion.createdAt)}
        </div>
      </td>

      <td className="p-4">
        {!isDeleted ? (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onStatusChange(discussion)}
          >
            Change Status
          </button>
        ) : (
          <span className="text-xs text-base-content/50">No actions</span>
        )}
      </td>
    </tr>
  );
}
