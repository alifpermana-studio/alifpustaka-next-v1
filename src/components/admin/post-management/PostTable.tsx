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
    <div className="border-base-300 bg-base-200 mt-6 overflow-x-auto rounded-xl border">
      <table className="w-full">
        <thead>
          <tr className="border-base-300 bg-base-300/50 border-b">
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Post
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Author
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Status
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Tags
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Submitted
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Updated
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-base-content/70 p-8 text-center">
                No posts found
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <PostTableRow key={post.id} post={post} onClick={onPostClick} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
