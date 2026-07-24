"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useNotification } from "@/context/NotificationContext";
import { useState, useEffect, useCallback } from "react";
import { Post, PostStatus } from "apus-post";
import { PostFilters } from "@/components/blog/PostFilters";
import { PostTable } from "@/components/blog/PostTable";
import { PostBulkActionBar } from "@/components/blog/PostBulkActionBar";
import { PostPagination } from "@/components/blog/PostPagination";
import { DeletePostModal } from "@/components/blog/DeletePostModal";
import { BulkStatusChangeModal } from "@/components/blog/BulkStatusChangeModal";
import { BulkTagModal } from "@/components/blog/BulkTagModal";
import { useRouter } from "next/navigation";

interface FilterState {
  search: string;
  status: PostStatus | "";
  sort: string;
  order: string;
}

export default function BlogPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { fetchNotifications } = useNotification();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    status: "published",
    sort: "updatedAt",
    order: "desc",
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  });
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkTagModalOpen, setBulkTagModalOpen] = useState(false);

  const fetchPosts = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);

      const params = new URLSearchParams({
        skip: String(pagination.skip),
        max: String(pagination.limit),
        sort: filter.sort,
        order: filter.order,
        ...(filter.search && { search: filter.search }),
        ...(filter.status && { status: filter.status }),
      });

      try {
        const response = await fetch(`/api/post-list?${params}`);
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
    setSelectedPosts(new Set());
  }, [pagination.skip, filter]);

  const handleSelectPost = (id: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPosts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = posts
        .filter((p) => p.status !== "deleted")
        .map((p) => p.id);
      setSelectedPosts(new Set(selectableIds));
    } else {
      setSelectedPosts(new Set());
    }
  };

  const handleDeletePost = (post: Post) => {
    setDeleteTarget(post);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch("/api/blog-post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleted",
          data: {
            id: deleteTarget.id,
            title: deleteTarget.title,
            slug: deleteTarget.slug,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("Post deleted successfully", "success");
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        fetchPosts(false);
      } else {
        showToast(
          result.error?.message || "Failed to delete post",
          "error",
        );
      }
    } catch (error) {
      showToast("Failed to delete post", "error");
    }
  };

  const handleBulkAction = (action: "status" | "delete" | "tags") => {
    if (selectedPosts.size === 0) {
      showToast("No posts selected", "warning");
      return;
    }

    if (action === "status") {
      setBulkStatusModalOpen(true);
    } else if (action === "delete") {
      handleBulkDelete();
    } else if (action === "tags") {
      setBulkTagModalOpen(true);
    }
  };

  const handleBulkStatusChange = async (status: PostStatus) => {
    const postIds = Array.from(selectedPosts);

    try {
      const response = await fetch("/api/posts/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_status",
          postIds,
          data: { status },
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setSelectedPosts(new Set());
        setBulkStatusModalOpen(false);
        fetchPosts(false);
        fetchNotifications();
      } else {
        showToast(
          result.error?.message || "Failed to change status",
          "error",
        );
      }
    } catch (error) {
      showToast("Failed to change status", "error");
    }
  };

  const handleBulkDelete = async () => {
    const postIds = Array.from(selectedPosts);

    const confirmed = confirm(
      `Are you sure you want to delete ${postIds.length} post(s)?`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch("/api/posts/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          postIds,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setSelectedPosts(new Set());
        fetchPosts(false);
        fetchNotifications();
      } else {
        showToast(
          result.error?.message || "Failed to delete posts",
          "error",
        );
      }
    } catch (error) {
      showToast("Failed to delete posts", "error");
    }
  };

  const handleBulkTags = async (action: "add" | "remove", tags: string[]) => {
    const postIds = Array.from(selectedPosts);

    try {
      const response = await fetch("/api/posts/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "add" ? "add_tags" : "remove_tags",
          postIds,
          data: { tags },
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setSelectedPosts(new Set());
        setBulkTagModalOpen(false);
        fetchPosts(false);
      } else {
        showToast(
          result.error?.message || "Failed to manage tags",
          "error",
        );
      }
    } catch (error) {
      showToast("Failed to manage tags", "error");
    }
  };

  const handlePageChange = (skip: number) => {
    setPagination((prev) => ({ ...prev, skip }));
  };

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-base-content text-2xl font-bold">Access Denied</h1>
        <p className="text-base-content/70 mt-2">
          You need to be logged in to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="">
      <PostFilters
        filter={filter}
        onFilterChange={setFilter}
        totalPosts={pagination.total}
        loading={loading}
        onRefresh={() => fetchPosts(false)}
      />

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-base-content/70">Loading posts...</p>
        </div>
      ) : (
        <>
          <PostTable
            posts={posts}
            selectedPosts={selectedPosts}
            onSelectPost={handleSelectPost}
            onSelectAll={handleSelectAll}
            onDeletePost={handleDeletePost}
          />

          <PostPagination
            skip={pagination.skip}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {selectedPosts.size > 0 && (
        <PostBulkActionBar
          selectedCount={selectedPosts.size}
          onClearSelection={() => setSelectedPosts(new Set())}
          onBulkAction={handleBulkAction}
        />
      )}

      <DeletePostModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        post={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />

      <BulkStatusChangeModal
        isOpen={bulkStatusModalOpen}
        onClose={() => setBulkStatusModalOpen(false)}
        selectedCount={selectedPosts.size}
        onConfirm={handleBulkStatusChange}
      />

      <BulkTagModal
        isOpen={bulkTagModalOpen}
        onClose={() => setBulkTagModalOpen(false)}
        selectedCount={selectedPosts.size}
        onConfirm={handleBulkTags}
      />
    </div>
  );
}
