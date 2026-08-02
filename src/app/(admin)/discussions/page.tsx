"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useState, useEffect, useCallback } from "react";
import {
  DiscussionListItem,
  DiscussionStatus,
  DiscussionSourceType,
} from "@/types/discussion";
import { DiscussionFilters } from "@/components/discussion/DiscussionFilters";
import { DiscussionTable } from "@/components/discussion/DiscussionTable";
import { DiscussionPagination } from "@/components/discussion/DiscussionPagination";
import { EditDiscussionModal } from "@/components/discussion/EditDiscussionModal";
import { DeleteDiscussionModal } from "@/components/discussion/DeleteDiscussionModal";
import { DiscussionBulkActionBar } from "@/components/discussion/DiscussionBulkActionBar";
import { BulkStatusChangeModal } from "@/components/discussion/BulkStatusChangeModal";

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

  const [selectedDiscussions, setSelectedDiscussions] = useState<Set<string>>(new Set());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DiscussionListItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiscussionListItem | null>(
    null,
  );
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);

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
          showToast(
            result.error?.message || "Failed to fetch comments",
            "error",
          );
        }
      } catch (error) {
        showToast("Failed to fetch comments", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [pagination.skip, pagination.limit, filter, showToast],
  );

  useEffect(() => {
    fetchDiscussions(false);
  }, [filter, pagination.skip]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, skip: 0 }));
  }, [filter]);

  useEffect(() => {
    setSelectedDiscussions(new Set());
  }, [pagination.skip, filter]);

  const handleSelectDiscussion = (id: string) => {
    const newSelected = new Set(selectedDiscussions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDiscussions(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = discussions
        .filter((d) => d.status !== "deleted")
        .map((d) => d.id);
      setSelectedDiscussions(new Set(selectableIds));
    } else {
      setSelectedDiscussions(new Set());
    }
  };

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

  const handleBulkAction = (action: "status" | "delete") => {
    if (selectedDiscussions.size === 0) {
      showToast("No comments selected", "warning");
      return;
    }

    if (action === "status") {
      setBulkStatusModalOpen(true);
    } else if (action === "delete") {
      handleBulkDelete();
    }
  };

  const handleBulkStatusChange = async (status: DiscussionStatus) => {
    const discussionIds = Array.from(selectedDiscussions);

    try {
      const response = await fetch("/api/discussions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_status",
          discussionIds,
          data: { status },
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setSelectedDiscussions(new Set());
        setBulkStatusModalOpen(false);
        fetchDiscussions(false);
      } else {
        showToast(result.error?.message || "Failed to change status", "error");
      }
    } catch (error) {
      showToast("Failed to change status", "error");
    }
  };

  const handleBulkDelete = async () => {
    const discussionIds = Array.from(selectedDiscussions);

    const confirmed = confirm(
      `Are you sure you want to delete ${discussionIds.length} comment(s)? They will be permanently removed after 30 days.`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch("/api/discussions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          discussionIds,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setSelectedDiscussions(new Set());
        fetchDiscussions(false);
      } else {
        showToast(result.error?.message || "Failed to delete comments", "error");
      }
    } catch (error) {
      showToast("Failed to delete comments", "error");
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
            selectedDiscussions={selectedDiscussions}
            onSelectDiscussion={handleSelectDiscussion}
            onSelectAll={handleSelectAll}
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

      {selectedDiscussions.size > 0 && (
        <DiscussionBulkActionBar
          selectedCount={selectedDiscussions.size}
          onClearSelection={() => setSelectedDiscussions(new Set())}
          onBulkAction={handleBulkAction}
        />
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

      <BulkStatusChangeModal
        isOpen={bulkStatusModalOpen}
        onClose={() => setBulkStatusModalOpen(false)}
        selectedCount={selectedDiscussions.size}
        onConfirm={handleBulkStatusChange}
      />
    </div>
  );
}
