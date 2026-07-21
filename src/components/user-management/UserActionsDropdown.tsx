import { UserRole, UserStatus } from "@/types/roles";
import { useAuth } from "@/context/AuthContext";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreVertical, Edit, Shield, Activity } from "lucide-react";
import { useState, useRef } from "react";

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

interface UserActionsDropdownProps {
  user: UserListItem;
  onEdit: (user: UserListItem) => void;
}

export function UserActionsDropdown({ user, onEdit }: UserActionsDropdownProps) {
  const { hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const canChangeRole = hasPermission("manage_user_roles");
  const canChangeStatus = hasPermission("manage_user_status");

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 text-base-content/70 transition-colors hover:bg-base-300 hover:text-base-content"
        aria-label="User actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef}>
        <div className="w-48 rounded-xl border border-base-300 bg-base-200 py-1 shadow-lg">
          <DropdownItem
            onClick={() => {
              onEdit(user);
              setIsOpen(false);
            }}
            disabled={!canChangeRole && !canChangeStatus}
          >
            <Edit className="h-4 w-4" />
            <span>Edit User</span>
          </DropdownItem>

          {canChangeRole && (
            <DropdownItem
              onClick={() => {
                onEdit(user);
                setIsOpen(false);
              }}
            >
              <Shield className="h-4 w-4" />
              <span>Change Role</span>
            </DropdownItem>
          )}

          {canChangeStatus && (
            <DropdownItem
              onClick={() => {
                onEdit(user);
                setIsOpen(false);
              }}
            >
              <Activity className="h-4 w-4" />
              <span>Change Status</span>
            </DropdownItem>
          )}
        </div>
      </Dropdown>
    </div>
  );
}
