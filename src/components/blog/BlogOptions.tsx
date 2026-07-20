"use client";

import { usePost } from "@/context/PostContext";

import { Post } from "apus-post";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export const BlogOptions = () => {
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

  return (
    <div className="border-base-300 bg-base-200 rounded-lg border p-5">
      test
    </div>
  );
};
