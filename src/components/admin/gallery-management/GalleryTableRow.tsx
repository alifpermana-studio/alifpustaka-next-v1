import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface GalleryListItem {
  id: string;
  title: string;
  slug: string;
  format: string;
  isPrivate: boolean;
  footnote: string | null;
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

interface GalleryTableRowProps {
  gallery: GalleryListItem;
  onClick: (slug: string) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function GalleryTableRow({ gallery, onClick }: GalleryTableRowProps) {
  const formattedUploadDate = new Date(gallery.uploadTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedUpdateDate = gallery.updatedAt
    ? new Date(gallery.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  const displayTags = gallery.tags.slice(0, 3);
  const remainingTags = gallery.tags.length - 3;

  return (
    <tr
      className="border-b border-base-300 transition-colors hover:bg-base-300/30 cursor-pointer"
      onClick={() => onClick(gallery.slug)}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Image
            src={`/api/image?p=${gallery.isPrivate}&src=${gallery.slug}${gallery.format}`}
            alt={gallery.title}
            width={40}
            height={40}
            className="rounded object-cover"
          />
          <div>
            <div className="font-medium text-base-content">{gallery.title}</div>
            <div className="text-xs text-base-content/60">{gallery.slug}</div>
          </div>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-3">
          {gallery.author.image ? (
            <Image
              src={gallery.author.image}
              alt={gallery.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-xs">
              {getInitials(gallery.author.name)}
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-base-content">{gallery.author.name}</div>
            {gallery.author.username && (
              <div className="text-xs text-base-content/60">@{gallery.author.username}</div>
            )}
          </div>
        </div>
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
        <div className="text-sm text-base-content/70">{formattedUploadDate}</div>
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
            onClick(gallery.slug);
          }}
        >
          View
        </Button>
      </td>
    </tr>
  );
}
