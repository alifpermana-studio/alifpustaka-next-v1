import { Post, PostStatus } from "apus-post";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { PostActionsDropdown } from "./PostActionsDropdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface PostTableRowProps {
  post: Post;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (post: Post) => void;
}

const STATUS_BADGE_CONFIG: Record<PostStatus, { variant: any; label: string }> = {
  published: { variant: "success", label: "Published" },
  submitted: { variant: "warning", label: "Submitted" },
  drafted: { variant: "info", label: "Drafted" },
  deleted: { variant: "danger", label: "Deleted" },
};

export function PostTableRow({ post, isSelected, onSelect, onDelete }: PostTableRowProps) {
  const isDeleted = post.status === "deleted";
  const canSelect = !isDeleted;

  const formattedDate = new Date(post.updatedAt || post.uploadTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <tr
      className={`border-b border-base-300 transition-colors hover:bg-base-300/30 ${
        isDeleted ? "opacity-60 bg-danger/5" : ""
      }`}
    >
      <td className="p-4">
        {canSelect ? (
          <Checkbox checked={isSelected} onChange={() => onSelect(post.id)} />
        ) : (
          <Checkbox checked={false} onChange={() => {}} disabled />
        )}
      </td>

      <td className="p-4">
        <div className="font-medium text-base-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              code(props) {
                if (props.className) {
                  return <code {...props}>{props.children}</code>;
                } else {
                  return <code className="hljs language-lang">{props.children}</code>;
                }
              },
              p(props) {
                return <span {...props}>{props.children}</span>;
              },
            }}
          >
            {post.title}
          </ReactMarkdown>
        </div>
      </td>

      <td className="p-4">
        <div className="text-sm text-base-content/70">{formattedDate}</div>
      </td>

      <td className="p-4">
        <div className="flex flex-wrap gap-1">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded bg-gray-300 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-600 dark:text-gray-200"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-base-content/50">No tags</span>
          )}
        </div>
      </td>

      <td className="p-4">
        <Badge variant={STATUS_BADGE_CONFIG[post.status].variant}>
          {STATUS_BADGE_CONFIG[post.status].label}
        </Badge>
      </td>

      <td className="p-4">
        <PostActionsDropdown post={post} onDelete={onDelete} />
      </td>
    </tr>
  );
}
