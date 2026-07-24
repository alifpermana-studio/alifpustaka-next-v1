"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/AdminSidebar";
import { Header } from "@/components/layout/AdminHeader";
import { usePathname } from "next/navigation";
import { PostProvider } from "@/context/PostContext";
import { GalleryProvider } from "@/context/GalleryContext";
import { ToastProvider } from "@/context/ToastContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="bg-base-100 text-base-content h-screen lg:flex">
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <GalleryProvider>
              <PostProvider>
              <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              <div className="flex max-h-screen min-w-0 flex-1 flex-col overflow-y-auto">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 px-4 py-6 md:p-5">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {children}
                  </motion.div>
                </main>
              </div>
              </PostProvider>
            </GalleryProvider>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </div>
  );
}
