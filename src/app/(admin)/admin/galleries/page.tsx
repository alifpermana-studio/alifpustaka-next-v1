import { GalleryManagement } from "@/components/admin/gallery-management/GalleryManagement";

export async function generateMetadata() {
  return {
    title: "Admin | Gallery Management",
    description: "Review and manage public galleries from users",
  };
}

export default function GalleryManagementPage() {
  return <GalleryManagement />;
}
