"use client";

import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-base-content">Admin Dashboard</h1>
      <p className="text-base-content/70 mt-2">
        Welcome, {user?.name}. This is the admin overview page.
      </p>
    </div>
  );
}
