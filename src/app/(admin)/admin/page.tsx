import { AdminComponent } from "@/components/admin/AdminComponent";

export async function generateMetadata() {
  return {
    title: "Admin | Preview Panel",
    description: "Overview of your admin task.",
  };
}

export default function AdminPage() {
  return <AdminComponent />;
}
