import { PostStatus } from "apus-post";
import { PostTableRow } from "./PostTableRow";

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

interface PostTableProps {
  posts: PostListItem[];
  onPostClick: (slug: string) => void;
}

export function PostTable({ posts, onPostClick }: PostTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-base-300 bg-base-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-base-300 bg-base-300/50">
            <th className="p-4 text-left text-sm font-semibold text-base-content">Post</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Author</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Status</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Tags</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Submitted</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Updated</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-base-content/70">
                No posts found
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <PostTableRow
                key={post.id}
                post={post}
                onClick={onPostClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
