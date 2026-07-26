import { PostManagement } from "@/components/admin/post-management/PostManagement";

export async function generateMetadata() {
  return {
    title: "Admin | Post Management",
    description: "Review and manage posts from authors",
  };
}

export default function PostManagementPage() {
  return <PostManagement />;
}
