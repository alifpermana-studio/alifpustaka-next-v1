import { UserManagement } from "@/components/admin/user-management/UserManagement";

export async function generateMetadata() {
  return {
    title: "Admin | User Management",
    description: "Manage user status and role.",
  };
}

export default function UserManagementPage() {
  return <UserManagement />;
}
