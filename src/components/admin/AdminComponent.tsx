"use client";

import { useAuth } from "@/context/AuthContext";

export const AdminComponent = () => {
  const { user } = useAuth();
  return (
    <div className="p-6">
      <h1 className="text-base-content text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-base-content/70 mt-2">
        Welcome, {user?.name}. This is the admin overview page.
      </p>
    </div>
  );
};
