import { DiscussionManagement } from "@/components/admin/discussion-management/DiscussionManagement";

export async function generateMetadata() {
  return {
    title: "Admin | Discussion Management",
    description: "Review and manage comments from users",
  };
}

export default function DiscussionManagementPage() {
  return <DiscussionManagement />;
}
