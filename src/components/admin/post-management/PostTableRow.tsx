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

const STATUS_BADGE_CONFIG: Record<PostStatus, { variant: any; label: string }> =
  {
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

  const formattedSubmitDate = new Date(post.uploadTime).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

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
      className={`border-base-300 hover:bg-base-300/30 cursor-pointer border-b transition-colors ${
        isDeleted ? "bg-danger/5 opacity-60" : ""
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
            <div className="bg-accent/15 text-accent flex h-10 w-10 items-center justify-center rounded text-sm font-semibold">
              {post.title.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-base-content font-medium">{post.title}</div>
            <div className="text-base-content/60 text-xs">{post.slug}</div>
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
            <div className="bg-accent/15 text-accent flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
              {getInitials(post.author.name)}
            </div>
          )}
          <div>
            <div className="text-base-content text-sm font-medium">
              {post.author.name}
            </div>
            {post.author.username && (
              <div className="text-base-content/60 text-xs">
                @{post.author.username}
              </div>
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
                <span key={index} className="text-base-content/70 text-xs">
                  {tag}
                  {index < displayTags.length - 1 && ","}
                </span>
              ))}
              {remainingTags > 0 && (
                <span className="text-base-content/50 text-xs">
                  +{remainingTags} more
                </span>
              )}
            </>
          ) : (
            <span className="text-base-content/50 text-xs">No tags</span>
          )}
        </div>
      </td>

      <td className="p-4">
        <div className="text-base-content/70 text-sm">
          {formattedSubmitDate}
        </div>
      </td>

      <td className="p-4">
        <div className="text-base-content/70 text-sm">
          {formattedUpdateDate}
        </div>
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
