import { UserRole, UserStatus } from "@/types/roles";
import { Checkbox } from "@/components/ui/Checkbox";
import { UserTableRow } from "./UserTableRow";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

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

interface UserTableProps {
  users: UserListItem[];
  selectedUsers: Set<string>;
  onSelectUser: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onEditUser: (user: UserListItem) => void;
}

export function UserTable({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEditUser,
}: UserTableProps) {
  const { canManageUser } = useAuth();

  const selectableUsers = useMemo(() => {
    return users.filter((u) => canManageUser(u.role) && u.status !== "deleted");
  }, [users, canManageUser]);

  const selectableCount = selectableUsers.length;
  const isAllSelected = selectableCount > 0 && selectedUsers.size === selectableCount;
  const isIndeterminate = selectedUsers.size > 0 && selectedUsers.size < selectableCount;

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-base-300 bg-base-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-base-300 bg-base-300/50">
            <th className="p-4 text-left">
              <Checkbox
                checked={isAllSelected}
                onChange={onSelectAll}
                indeterminate={isIndeterminate}
              />
            </th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">User</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Email</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Role</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Status</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Created</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-base-content/70">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUsers.has(user.id)}
                onSelect={onSelectUser}
                onEdit={onEditUser}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
