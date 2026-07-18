"use client";

import { usePost } from "@/context/PostContext";

import { Post } from "apus-post";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { PostFilter } from "./PostFilter";
import { OptionList } from "./OptionList";
import { useRouter } from "next/navigation";
import formatDate from "@/lib/FormatDate";

export const BlogComponent = () => {
  const [postList, setPostList] = useState<Post[]>([]);
  const { refresh, loading, data } = usePost();

  useEffect(() => {
    if (!loading) {
      console.log("triggered");
      const transformData = data.map((post) => {
        const time = post.uploadTime;
        return { ...post, uploadTime: time };
      });

      setPostList(transformData);
    }
  }, [loading]);

  useEffect(() => {
    console.log("Check postList: ", postList);
  }, [postList]);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="">
      <PostFilter />
      <PostLists postList={postList} loading={loading} />
    </div>
  );
};

type PostListsProps = {
  postList: Post[];
  loading: boolean;
};

const PostLists = ({ postList, loading }: PostListsProps) => {
  const [onHover, setOnHover] = useState("");
  const router = useRouter();
  return (
    <table className="text-base-content w-full border-separate border-spacing-y-2">
      <thead className="bg-base-300">
        <tr>
          <th className="rounded-l-lg px-4 py-2">Title</th>
          <th className="opacity-30">|</th>
          <th className="px-4 py-2">Upload Time</th>
          <th className="opacity-30">|</th>
          <th className="px-4 py-2">Tags</th>
          <th className="opacity-30">|</th>
          <th className="px-4 py-2">Status</th>
          <th className="opacity-30">|</th>
          <th className="rounded-r-lg px-4 py-2"></th>
        </tr>
      </thead>
      <tbody className="">
        {loading ? (
          <tr>
            <td
              colSpan={5}
              className="rounded-lg bg-gray-200 p-4 text-center dark:bg-gray-800"
            >
              <div className="flex w-full flex-row items-center justify-center gap-4">
                <RefreshCw className="animate-spin" />
                <span>Loading...</span>
              </div>
            </td>
          </tr>
        ) : (
          postList.map((post) => (
            <tr
              onMouseEnter={() => setOnHover(post.id)}
              onMouseLeave={() => setOnHover("")}
              key={post.id}
              onClick={() => router.push(`/blog/editor?key=${post.id}`)}
              className="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-[1.01] hover:bg-gray-300 active:scale-[1.02] hover:dark:bg-gray-700"
            >
              <td
                className={`${onHover === post.id ? "bg-gray-300 dark:bg-gray-700" : "bg-gray-200 dark:bg-gray-800"} rounded-l-lg p-4 text-left`}
              >
                <TitleMarkdown post={post} />
              </td>
              <td
                className={`${onHover === post.id ? "bg-gray-300 dark:bg-gray-700" : "bg-gray-200 dark:bg-gray-800"} p-4 text-center`}
              >
                {post.uploadTime.toString()}
              </td>
              <td
                className={`${onHover === post.id ? "bg-gray-300 dark:bg-gray-700" : "bg-gray-200 dark:bg-gray-800"} p-4 text-center`}
              >
                <div className="flex flex-wrap justify-center gap-1">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded bg-gray-300 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                    >
                      {tag.tag.name}
                    </span>
                  ))}
                </div>
              </td>
              <td
                className={`${onHover === post.id ? "bg-gray-300 dark:bg-gray-700" : "bg-gray-200 dark:bg-gray-800"} p-4 text-center`}
              >
                <span
                  className={`rounded px-2 py-1 text-sm font-semibold ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800"
                      : post.status === "deleted"
                        ? "bg-red-100 text-red-800"
                        : post.status === "drafted"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {post.status}
                </span>
              </td>
              <td
                onClick={(e) => e.stopPropagation()}
                className={`${onHover === post.id ? "bg-gray-300 dark:bg-gray-700" : "bg-gray-200 dark:bg-gray-800"} rounded-r-lg p-4 text-center`}
              >
                <OptionList post={post} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

type TItleMarkdownType = {
  post: Post;
};

const TitleMarkdown = ({ post }: TItleMarkdownType) => {
  return (
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
      }}
    >
      {post.title}
    </ReactMarkdown>
  );
};
