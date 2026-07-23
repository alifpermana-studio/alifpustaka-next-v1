import { Post, PostStatus } from "apus-post";
import { Checkbox } from "@/components/ui/Checkbox";
import { PostTableRow } from "./PostTableRow";
import { useMemo } from "react";

interface PostTableProps {
  posts: Post[];
  selectedPosts: Set<string>;
  onSelectPost: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onDeletePost: (post: Post) => void;
}

export function PostTable({
  posts,
  selectedPosts,
  onSelectPost,
  onSelectAll,
  onDeletePost,
}: PostTableProps) {
  const selectablePosts = useMemo(() => {
    return posts.filter((p) => p.status !== "deleted");
  }, [posts]);

  const selectableCount = selectablePosts.length;
  const isAllSelected = selectableCount > 0 && selectedPosts.size === selectableCount;
  const isIndeterminate = selectedPosts.size > 0 && selectedPosts.size < selectableCount;

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-base-300 bg-base-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-base-300 bg-base-300/50">
            <th className="p-4 text-left">
              <Checkbox
                checked={isAllSelected}
                onChange={onSelectAll}
                indeterminate={isIndeterminate}
              />
            </th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Title</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Last Updated</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Tags</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Status</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-base-content/70">
                No posts found
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <PostTableRow
                key={post.id}
                post={post}
                isSelected={selectedPosts.has(post.id)}
                onSelect={onSelectPost}
                onDelete={onDeletePost}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
