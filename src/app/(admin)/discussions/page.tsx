"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useState, useEffect, useCallback } from "react";
import { DiscussionListItem, DiscussionStatus, DiscussionSourceType } from "@/types/discussion";
import { DiscussionFilters } from "@/components/discussion/DiscussionFilters";
import { DiscussionTable } from "@/components/discussion/DiscussionTable";
import { DiscussionPagination } from "@/components/discussion/DiscussionPagination";
import { EditDiscussionModal } from "@/components/discussion/EditDiscussionModal";
import { DeleteDiscussionModal } from "@/components/discussion/DeleteDiscussionModal";

interface FilterState {
  search: string;
  status: DiscussionStatus | "";
  sourceType: DiscussionSourceType | "";
}

export default function DiscussionsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [discussions, setDiscussions] = useState<DiscussionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    status: "",
    sourceType: "",
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DiscussionListItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiscussionListItem | null>(null);

  const fetchDiscussions = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);

      const params = new URLSearchParams({
        skip: String(pagination.skip),
        limit: String(pagination.limit),
        ...(filter.search && { search: filter.search }),
        ...(filter.status && { status: filter.status }),
        ...(filter.sourceType && { sourceType: filter.sourceType }),
      });

      try {
        const response = await fetch(`/api/discussions?${params}`);
        const result = await response.json();

        if (result.success) {
          setDiscussions(result.data);
          setPagination((prev) => ({
            ...prev,
            total: result.meta.pagination?.total || 0,
            hasMore: result.meta.pagination?.hasMore || false,
          }));
        } else {
          showToast(result.error?.message || "Failed to fetch comments", "error");
        }
      } catch (error) {
        showToast("Failed to fetch comments", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [pagination.skip, pagination.limit, filter, showToast]
  );

  useEffect(() => {
    fetchDiscussions(false);
  }, [filter, pagination.skip]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, skip: 0 }));
  }, [filter]);

  const handleEdit = (discussion: DiscussionListItem) => {
    setEditTarget(discussion);
    setEditModalOpen(true);
  };

  const handleEditConfirm = async (content: string) => {
    if (!editTarget) return;

    try {
      const response = await fetch(`/api/discussions/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("Comment updated successfully", "success");
        setEditModalOpen(false);
        setEditTarget(null);
        fetchDiscussions(false);
      } else {
        showToast(result.error?.message || "Failed to update comment", "error");
      }
    } catch (error) {
      showToast("Failed to update comment", "error");
    }
  };

  const handleDelete = (discussion: DiscussionListItem) => {
    setDeleteTarget(discussion);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`/api/discussions/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        showToast("Comment deleted successfully", "success");
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        fetchDiscussions(false);
      } else {
        showToast(result.error?.message || "Failed to delete comment", "error");
      }
    } catch (error) {
      showToast("Failed to delete comment", "error");
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-base-content">My Comments</h1>
        <p className="text-base-content/70 mt-1">
          Manage your comments across all posts
        </p>
      </div>

      <DiscussionFilters
        filter={filter}
        onFilterChange={setFilter}
        totalDiscussions={pagination.total}
        loading={loading}
        onRefresh={() => fetchDiscussions(false)}
      />

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-base-content/70">Loading comments...</p>
        </div>
      ) : (
        <>
          <DiscussionTable
            discussions={discussions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <DiscussionPagination
            skip={pagination.skip}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <EditDiscussionModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditTarget(null);
        }}
        discussion={editTarget}
        onConfirm={handleEditConfirm}
      />

      <DeleteDiscussionModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        discussion={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
