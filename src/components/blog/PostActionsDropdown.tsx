import { Post } from "apus-post";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreVertical, Eye, Copy, Pencil, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

interface PostActionsDropdownProps {
  post: Post;
  onDelete: (post: Post) => void;
}

export function PostActionsDropdown({
  post,
  onDelete,
}: PostActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${baseURL}/${post.slug}`).then(() => {
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-base-content/70 hover:bg-base-300 hover:text-base-content cursor-pointer rounded-lg p-2 transition-colors"
        aria-label="Post actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
      >
        <div className="border-base-content/40 bg-base-300 w-48 rounded-xl border p-1 shadow-lg">
          <DropdownItem
            onClick={() => {
              router.push(`/blog/preview/${post.slug}`);
              setIsOpen(false);
            }}
            className="hover:bg-base-200 text-base-content flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </DropdownItem>

          <DropdownItem
            onClick={handleCopyLink}
            className="hover:bg-base-200 text-base-content flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Link</span>
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              router.push(`/blog/editor?key=${post.id}`);
              setIsOpen(false);
            }}
            className="hover:bg-base-200 text-base-content flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              onDelete(post);
              setIsOpen(false);
            }}
            className="hover:bg-base-200 text-base-content flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}
