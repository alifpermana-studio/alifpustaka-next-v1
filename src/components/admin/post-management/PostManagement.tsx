"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useNotification } from "@/context/NotificationContext";
import { useState, useEffect, useCallback } from "react";
import { PostStatus } from "apus-post";
import { PostFilters } from "./PostFilters";
import { PostTable } from "./PostTable";
import { PostPagination } from "./PostPagination";
import { useRouter } from "next/navigation";

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

interface FilterState {
  search: string;
  status: PostStatus | "";
}

export function PostManagement() {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();
  const { fetchNotifications } = useNotification();
  const router = useRouter();

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  if (!hasPermission("review_posts")) {
    router.push("/admin");
    return (
      <div className="p-6">
        <h1 className="text-base-content text-2xl font-bold">Access Denied</h1>
        <p className="text-base-content/70 mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  const fetchPosts = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);

      const params = new URLSearchParams({
        skip: String(pagination.skip),
        limit: String(pagination.limit),
        sort: "uploadTime",
        order: "desc",
        ...(filter.search && { search: filter.search }),
        ...(filter.status && { status: filter.status }),
      });

      try {
        const response = await fetch(`/api/admin/posts?${params}`);
        const result = await response.json();

        if (result.success) {
          setPosts(result.data);
          setPagination((prev) => ({
            ...prev,
            total: result.meta.pagination?.total || 0,
            hasMore: result.meta.pagination?.hasMore || false,
          }));
          setLastUpdated(new Date());
        } else {
          showToast(
            result.error?.message || "Failed to fetch posts",
            "error",
          );
        }
      } catch (error) {
        showToast("Failed to fetch posts", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [pagination.skip, pagination.limit, filter, showToast],
  );

  useEffect(() => {
    fetchPosts(false);
  }, [filter, pagination.skip]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPosts(true);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchPosts]);

  const handlePostClick = (slug: string) => {
    router.push(`/admin/post-management/review/${slug}`);
  };

  const handlePageChange = (skip: number) => {
    setPagination((prev) => ({ ...prev, skip }));
  };

  return (
    <div className="">
      <div className="mb-6">
        <p className="text-base-content/70 mt-1">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <PostFilters
        filter={filter}
        onFilterChange={setFilter}
        totalPosts={pagination.total}
      />

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-base-content/70">Loading posts...</p>
        </div>
      ) : (
        <>
          <PostTable
            posts={posts}
            onPostClick={handlePostClick}
          />

          <PostPagination
            skip={pagination.skip}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
