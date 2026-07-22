import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { UserRole, UserStatus } from "@/types/roles";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useMemo } from "react";

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

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserListItem | null;
  onSave: (userId: string, updates: { role?: UserRole; status?: UserStatus }) => Promise<void>;
}

export function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const { user: currentUser, hasPermission } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedStatus(user.status);
    }
  }, [user]);

  const canChangeRole = hasPermission("manage_user_roles");
  const canChangeStatus = hasPermission("manage_user_status");

  const availableRoles = useMemo(() => {
    if (!currentUser) return [];

    const allRoles: { value: UserRole; label: string }[] = [
      { value: "user", label: "User" },
      { value: "author", label: "Author" },
      { value: "editor", label: "Editor" },
      { value: "support_admin", label: "Support Admin" },
      { value: "sales_admin", label: "Sales Admin" },
      { value: "user_admin", label: "User Admin" },
      { value: "content_admin", label: "Content Admin" },
      { value: "super_admin", label: "Super Admin" },
    ];

    if (currentUser.role === "super_admin") {
      return allRoles;
    }

    if (currentUser.role === "user_admin") {
      return allRoles.filter((r) => ["user", "author", "editor"].includes(r.value));
    }

    return [];
  }, [currentUser]);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "banned", label: "Banned" },
  ];

  const hasChanges =
    user && (selectedRole !== user.role || selectedStatus !== user.status);

  const handleSave = async () => {
    if (!user || !hasChanges) return;

    setSaving(true);
    const updates: { role?: UserRole; status?: UserStatus } = {};

    if (selectedRole && selectedRole !== user.role) {
      updates.role = selectedRole;
    }

    if (selectedStatus && selectedStatus !== user.status) {
      updates.status = selectedStatus;
    }

    await onSave(user.id, updates);
    setSaving(false);
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-base-content">Edit User</h2>

        <div className="mt-4 space-y-4">
          <div>
            <div className="text-sm font-medium text-base-content">User Information</div>
            <div className="mt-2 rounded-lg bg-base-300/50 p-3 text-sm">
              <div className="font-medium text-base-content">{user.name}</div>
              {user.username && (
                <div className="text-base-content/60">@{user.username}</div>
              )}
              <div className="text-base-content/60">{user.email}</div>
            </div>
          </div>

          {canChangeRole && (
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                Role
              </label>
              <Select
                value={selectedRole}
                onChange={(value) => setSelectedRole(value as UserRole)}
                options={availableRoles}
                disabled={saving}
              />
              {user.role !== selectedRole && (
                <div className="mt-1 text-xs text-base-content/60">
                  Will change from {user.role} to {selectedRole}
                </div>
              )}
            </div>
          )}

          {canChangeStatus && (
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                Status
              </label>
              <Select
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value as UserStatus)}
                options={statusOptions}
                disabled={saving}
              />
              {user.status !== selectedStatus && (
                <div className="mt-1 text-xs text-base-content/60">
                  Will change from {user.status} to {selectedStatus}
                </div>
              )}
            </div>
          )}

          {hasChanges && (
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-base-content">
              This action will be logged in the audit trail.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? "Saving..." : "Confirm Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
