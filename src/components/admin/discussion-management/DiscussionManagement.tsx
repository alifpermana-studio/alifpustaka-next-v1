"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useNotification } from "@/context/NotificationContext";
import { useState, useEffect, useCallback } from "react";
import {
  DiscussionListItem,
  DiscussionStatus,
  DiscussionSourceType,
} from "@/types/discussion";
import { DiscussionFilters } from "./DiscussionFilters";
import { DiscussionTable } from "./DiscussionTable";
import { DiscussionPagination } from "./DiscussionPagination";
import { StatusChangeModal } from "./StatusChangeModal";
import { BulkActionBar } from "./BulkActionBar";
import { BulkActionConfirmModal } from "./BulkActionConfirmModal";
import { useRouter } from "next/navigation";

interface FilterState {
  search: string;
  status: DiscussionStatus | "";
  sourceType: DiscussionSourceType | "";
}

interface BulkActionState {
  action: "publish" | "ban" | "delete";
  discussionIds: string[];
  count: number;
}

export function DiscussionManagement() {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();
  const { fetchNotifications } = useNotification();
  const router = useRouter();

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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [selectedDiscussions, setSelectedDiscussions] = useState<Set<string>>(new Set());
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<DiscussionListItem | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkActionState | null>(null);
  const [bulkConfirmModalOpen, setBulkConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (!hasPermission("moderate_discussions")) {
      router.push("/admin");
    }
  }, [hasPermission, router]);

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
        const response = await fetch(`/api/admin/discussions?${params}`);
        const result = await response.json();

        if (result.success) {
          setDiscussions(result.data);
          setPagination((prev) => ({
            ...prev,
            total: result.meta.pagination?.total || 0,
            hasMore: result.meta.pagination?.hasMore || false,
          }));
          setLastUpdated(new Date());
        } else {
          showToast(
            result.error?.message || "Failed to fetch discussions",
            "error"
          );
        }
      } catch (error) {
        showToast("Failed to fetch discussions", "error");
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

  useEffect(() => {
    setSelectedDiscussions(new Set());
  }, [pagination.skip, filter]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchDiscussions(true);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchDiscussions]);

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
        .filter(d => d.status !== "deleted")
        .map(d => d.id);
      setSelectedDiscussions(new Set(selectableIds));
    } else {
      setSelectedDiscussions(new Set());
    }
  };

  const handleStatusChange = (discussion: DiscussionListItem) => {
    setStatusTarget(discussion);
    setStatusModalOpen(true);
  };

  const handleStatusChangeConfirm = async (status: DiscussionStatus) => {
    if (!statusTarget) return;

    try {
      const response = await fetch(
        `/api/admin/discussions/${statusTarget.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToast("Comment status updated successfully", "success");
        setStatusModalOpen(false);
        setStatusTarget(null);
        fetchDiscussions(false);
        fetchNotifications();
      } else {
        showToast(result.error?.message || "Failed to update status", "error");
      }
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const handleBulkActionClick = (action: "publish" | "ban" | "delete") => {
    const editableIds = Array.from(selectedDiscussions).filter(id => {
      const discussion = discussions.find(d => d.id === id);
      return discussion && discussion.status !== "deleted";
    });

    if (editableIds.length === 0) {
      showToast("No comments selected that can be modified", "warning");
      return;
    }

    setBulkAction({
      action,
      discussionIds: editableIds,
      count: editableIds.length,
    });
    setBulkConfirmModalOpen(true);
  };

  const handleBulkActionConfirm = async () => {
    if (!bulkAction) return;

    const statusMap = {
      publish: "published",
      ban: "banned",
      delete: "deleted",
    };

    try {
      const response = await fetch("/api/admin/discussions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_status",
          discussionIds: bulkAction.discussionIds,
          status: statusMap[bulkAction.action],
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          result.data.succeeded + " comment(s) updated" + 
          (result.data.failed > 0 ? `, ${result.data.failed} failed` : ""),
          result.data.failed > 0 ? "warning" : "success"
        );
        setSelectedDiscussions(new Set());
        setBulkConfirmModalOpen(false);
        setBulkAction(null);
        fetchDiscussions(false);
        fetchNotifications();
      } else {
        showToast(result.error?.message || "Failed to update comments", "error");
      }
    } catch (error) {
      showToast("Failed to update comments", "error");
    }
  };

  const handlePageChange = (skip: number) => {
    setPagination((prev) => ({ ...prev, skip }));
  };

  if (!hasPermission("moderate_discussions")) {
    return (
      <div className="p-6">
        <h1 className="text-base-content text-2xl font-bold">Access Denied</h1>
        <p className="text-base-content/70 mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-6">
        <p className="text-base-content/70 mt-1">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <DiscussionFilters
        filter={filter}
        onFilterChange={setFilter}
        totalDiscussions={pagination.total}
      />

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-base-content/70">Loading discussions...</p>
        </div>
      ) : (
        <>
          <DiscussionTable
            discussions={discussions}
            selectedDiscussions={selectedDiscussions}
            onSelectDiscussion={handleSelectDiscussion}
            onSelectAll={handleSelectAll}
            onStatusChange={handleStatusChange}
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
        <BulkActionBar
          selectedCount={selectedDiscussions.size}
          onClearSelection={() => setSelectedDiscussions(new Set())}
          onBulkAction={handleBulkActionClick}
        />
      )}

      <StatusChangeModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusTarget(null);
        }}
        discussion={statusTarget}
        onConfirm={handleStatusChangeConfirm}
      />

      <BulkActionConfirmModal
        isOpen={bulkConfirmModalOpen}
        onClose={() => {
          setBulkConfirmModalOpen(false);
          setBulkAction(null);
        }}
        action={bulkAction?.action || "publish"}
        count={bulkAction?.count || 0}
        onConfirm={handleBulkActionConfirm}
      />
    </div>
  );
}
