"use client";

import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useState, useEffect, useCallback } from "react";
import { UserRole, UserStatus } from "@/types/roles";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { BulkActionBar } from "./BulkActionBar";
import { UserPagination } from "./UserPagination";
import { EditUserModal } from "./EditUserModal";
import { BulkActionConfirmModal } from "./BulkActionConfirmModal";
import { useRouter } from "next/navigation";

interface UserListItem {
  id: string;
  name: string;
  username: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

interface FilterState {
  search: string;
  role: UserRole | "";
  status: UserStatus | "";
}

interface BulkActionState {
  action: "activate" | "deactivate" | "ban";
  userIds: string[];
  count: number;
}

export function UserManagement() {
  const { user, hasPermission, canManageUser } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    role: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  });
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActionState | null>(null);
  const [bulkConfirmModalOpen, setBulkConfirmModalOpen] = useState(false);

  if (!hasPermission("view_all_users")) {
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

  const fetchUsers = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);

      const params = new URLSearchParams({
        skip: String(pagination.skip),
        limit: String(pagination.limit),
        ...(filter.search && { search: filter.search }),
        ...(filter.role && { role: filter.role }),
        ...(filter.status && { status: filter.status }),
      });

      try {
        const response = await fetch(`/api/users?${params}`);
        const result = await response.json();

        if (result.success) {
          setUsers(result.data);
          setPagination((prev) => ({
            ...prev,
            total: result.meta.pagination?.total || 0,
            hasMore: result.meta.pagination?.hasMore || false,
          }));
          setLastUpdated(new Date());
        } else {
          showNotification(
            result.error?.message || "Failed to fetch users",
            "error",
          );
        }
      } catch (error) {
        showNotification("Failed to fetch users", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [pagination.skip, pagination.limit, filter, showNotification],
  );

  useEffect(() => {
    fetchUsers(false);
  }, [filter, pagination.skip]);

  useEffect(() => {
    setSelectedUsers(new Set());
  }, [pagination.skip, filter]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUsers(true);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchUsers]);

  const handleEditUser = (user: UserListItem) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (
    userId: string,
    updates: { role?: UserRole; status?: UserStatus },
  ) => {
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification("User updated successfully", "success");
        setEditModalOpen(false);
        setEditingUser(null);
        fetchUsers(false);
      } else {
        showNotification(
          result.error?.message || "Failed to update user",
          "error",
        );
      }
    } catch (error) {
      showNotification("Failed to update user", "error");
    }
  };

  const handleBulkActionClick = (action: "activate" | "deactivate" | "ban") => {
    const editableUserIds = Array.from(selectedUsers).filter((userId) => {
      const userItem = users.find((u) => u.id === userId);
      return (
        userItem &&
        canManageUser(userItem.role) &&
        userItem.status !== "deleted"
      );
    });

    if (editableUserIds.length === 0) {
      showNotification(
        "No users selected that you have permission to edit",
        "warning",
      );
      return;
    }

    setBulkAction({
      action,
      userIds: editableUserIds,
      count: editableUserIds.length,
    });
    setBulkConfirmModalOpen(true);
  };

  const handleBulkActionConfirm = async () => {
    if (!bulkAction) return;

    const statusMap = {
      activate: "active",
      deactivate: "inactive",
      ban: "banned",
    };

    const promises = bulkAction.userIds.map((userId) =>
      fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: statusMap[bulkAction.action] }),
      }),
    );

    const results = await Promise.allSettled(promises);

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    showNotification(
      `${succeeded} users updated${failed > 0 ? `, ${failed} failed` : ""}`,
      failed > 0 ? "warning" : "success",
    );

    setSelectedUsers(new Set());
    setBulkConfirmModalOpen(false);
    setBulkAction(null);
    fetchUsers(false);
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

      <UserFilters
        filter={filter}
        onFilterChange={setFilter}
        totalUsers={pagination.total}
      />

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-base-content/70">Loading users...</p>
        </div>
      ) : (
        <>
          <UserTable
            users={users}
            selectedUsers={selectedUsers}
            onSelectUser={(id) => {
              const newSelected = new Set(selectedUsers);
              if (newSelected.has(id)) {
                newSelected.delete(id);
              } else {
                newSelected.add(id);
              }
              setSelectedUsers(newSelected);
            }}
            onSelectAll={(checked) => {
              if (checked) {
                const selectableIds = users
                  .filter(
                    (u) => canManageUser(u.role) && u.status !== "deleted",
                  )
                  .map((u) => u.id);
                setSelectedUsers(new Set(selectableIds));
              } else {
                setSelectedUsers(new Set());
              }
            }}
            onEditUser={handleEditUser}
          />

          <UserPagination
            skip={pagination.skip}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {selectedUsers.size > 0 && (
        <BulkActionBar
          selectedCount={selectedUsers.size}
          onClearSelection={() => setSelectedUsers(new Set())}
          onBulkAction={handleBulkActionClick}
        />
      )}

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSaveUser}
      />

      <BulkActionConfirmModal
        isOpen={bulkConfirmModalOpen}
        onClose={() => {
          setBulkConfirmModalOpen(false);
          setBulkAction(null);
        }}
        action={bulkAction?.action || "activate"}
        count={bulkAction?.count || 0}
        onConfirm={handleBulkActionConfirm}
      />
    </div>
  );
}
