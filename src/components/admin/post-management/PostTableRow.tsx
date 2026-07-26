import { PostStatus } from "apus-post";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  desc: string | null;
  image: string;
  status: PostStatus;
  tags: string[];
  uploadTime: Date;
  updatedAt?: Date;
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    role: string;
  };
}

interface PostTableRowProps {
  post: PostListItem;
  onClick: (slug: string) => void;
}

const STATUS_BADGE_CONFIG: Record<PostStatus, { variant: any; label: string }> = {
  drafted: { variant: "neutral", label: "Drafted" },
  submitted: { variant: "warning", label: "Submitted" },
  published: { variant: "success", label: "Published" },
  deleted: { variant: "danger", label: "Deleted" },
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function PostTableRow({ post, onClick }: PostTableRowProps) {
  const isDeleted = post.status === "deleted";

  const formattedSubmitDate = new Date(post.uploadTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedUpdateDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  const displayTags = post.tags.slice(0, 3);
  const remainingTags = post.tags.length - 3;

  return (
    <tr
      className={`border-b border-base-300 transition-colors hover:bg-base-300/30 cursor-pointer ${
        isDeleted ? "opacity-60 bg-danger/5" : ""
      }`}
      onClick={() => onClick(post.slug)}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              width={40}
              height={40}
              className="rounded object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-accent/15 text-accent font-semibold text-sm">
              {post.title.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-base-content">{post.title}</div>
            <div className="text-xs text-base-content/60">{post.slug}</div>
          </div>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-3">
          {post.author.image ? (
            <Image
              src={post.author.image}
              alt={post.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-xs">
              {getInitials(post.author.name)}
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-base-content">{post.author.name}</div>
            {post.author.username && (
              <div className="text-xs text-base-content/60">@{post.author.username}</div>
            )}
          </div>
        </div>
      </td>

      <td className="p-4">
        <Badge variant={STATUS_BADGE_CONFIG[post.status].variant}>
          {STATUS_BADGE_CONFIG[post.status].label}
        </Badge>
      </td>

      <td className="p-4">
        <div className="flex flex-wrap gap-1">
          {displayTags.length > 0 ? (
            <>
              {displayTags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-base-content/70"
                >
                  {tag}
                  {index < displayTags.length - 1 && ","}
                </span>
              ))}
              {remainingTags > 0 && (
                <span className="text-xs text-base-content/50">
                  +{remainingTags} more
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-base-content/50">No tags</span>
          )}
        </div>
      </td>

      <td className="p-4">
        <div className="text-sm text-base-content/70">{formattedSubmitDate}</div>
      </td>

      <td className="p-4">
        <div className="text-sm text-base-content/70">{formattedUpdateDate}</div>
      </td>

      <td className="p-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick(post.slug);
          }}
        >
          View
        </Button>
      </td>
    </tr>
  );
}
