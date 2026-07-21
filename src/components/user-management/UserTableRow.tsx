import { UserRole, UserStatus } from "@/types/roles";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { UserActionsDropdown } from "./UserActionsDropdown";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

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

interface UserTableRowProps {
  user: UserListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (user: UserListItem) => void;
}

const ROLE_BADGE_CONFIG: Record<UserRole, { variant: any; label: string }> = {
  super_admin: { variant: "danger", label: "Super Admin" },
  content_admin: { variant: "warning", label: "Content Admin" },
  user_admin: { variant: "warning", label: "User Admin" },
  sales_admin: { variant: "info", label: "Sales Admin" },
  support_admin: { variant: "info", label: "Support Admin" },
  editor: { variant: "accent", label: "Editor" },
  author: { variant: "info", label: "Author" },
  user: { variant: "neutral", label: "User" },
};

const STATUS_BADGE_CONFIG: Record<UserStatus, { variant: any; label: string }> = {
  active: { variant: "success", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
  banned: { variant: "danger", label: "Banned" },
  deleted: { variant: "danger", label: "Deleted" },
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function UserTableRow({ user, isSelected, onSelect, onEdit }: UserTableRowProps) {
  const { canManageUser } = useAuth();

  const isDeleted = user.status === "deleted";
  const canEdit = !isDeleted && canManageUser(user.role);

  const formattedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <tr
      className={`border-b border-base-300 transition-colors hover:bg-base-300/30 ${
        isDeleted ? "opacity-60 bg-danger/5" : ""
      }`}
    >
      <td className="p-4">
        {canEdit ? (
          <Checkbox checked={isSelected} onChange={() => onSelect(user.id)} />
        ) : (
          <Checkbox checked={false} onChange={() => {}} disabled />
        )}
      </td>

      <td className="p-4">
        <div className="flex items-center gap-3">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-sm">
              {getInitials(user.name)}
            </div>
          )}
          <div>
            <div className="font-medium text-base-content">{user.name}</div>
            {user.username && (
              <div className="text-xs text-base-content/60">@{user.username}</div>
            )}
          </div>
        </div>
      </td>

      <td className="p-4">
        <div className="text-sm text-base-content">{user.email}</div>
      </td>

      <td className="p-4">
        <Badge variant={ROLE_BADGE_CONFIG[user.role].variant}>
          {ROLE_BADGE_CONFIG[user.role].label}
        </Badge>
      </td>

      <td className="p-4">
        <Badge variant={STATUS_BADGE_CONFIG[user.status].variant}>
          {STATUS_BADGE_CONFIG[user.status].label}
        </Badge>
      </td>

      <td className="p-4">
        <div className="text-sm text-base-content/70">{formattedDate}</div>
      </td>

      <td className="p-4">
        {canEdit ? (
          <UserActionsDropdown user={user} onEdit={onEdit} />
        ) : (
          <span className="text-xs text-base-content/50">No actions</span>
        )}
      </td>
    </tr>
  );
}
