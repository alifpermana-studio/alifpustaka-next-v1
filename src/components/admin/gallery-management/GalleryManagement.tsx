"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useNotification } from "@/context/NotificationContext";
import { useState, useEffect, useCallback } from "react";
import { GalleryFilters } from "./GalleryFilters";
import { GalleryTable } from "./GalleryTable";
import { GalleryPagination } from "./GalleryPagination";
import { GalleryModal } from "./GalleryModal";
import { useRouter } from "next/navigation";

interface GalleryListItem {
  id: string;
  title: string;
  slug: string;
  format: string;
  isPrivate: boolean;
  footnote: string | null;
  tags: string[];
  uploadTime: Date;
  updatedAt?: Date;
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    role: string;
  };
}

interface FilterState {
  search: string;
}

export function GalleryManagement() {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();
  const { fetchNotifications } = useNotification();
  const router = useRouter();

  const [galleries, setGalleries] = useState<GalleryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: "",
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedGallery, setSelectedGallery] = useState<GalleryListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!hasPermission("manage_public_gallery")) {
    router.push("/admin");
    return (
      <div className="p-6">
        <h1 className="text-base-content text-2xl font-bold">Access Denied</h1>
        <p className="text-base-content/70 mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  const fetchGalleries = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);

      const params = new URLSearchParams({
        skip: String(pagination.skip),
        limit: String(pagination.limit),
        sort: "uploadTime",
        order: "desc",
        ...(filter.search && { search: filter.search }),
      });

      try {
        const response = await fetch(`/api/galleries?${params}`);
        const result = await response.json();

        if (result.success) {
          setGalleries(result.data);
          setPagination((prev) => ({
            ...prev,
            total: result.meta.pagination?.total || 0,
            hasMore: result.meta.pagination?.hasMore || false,
          }));
          setLastUpdated(new Date());
        } else {
          showToast(
            result.error?.message || "Failed to fetch galleries",
            "error",
          );
        }
      } catch (error) {
        showToast("Failed to fetch galleries", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [pagination.skip, pagination.limit, filter, showToast],
  );

  useEffect(() => {
    fetchGalleries(false);
  }, [filter, pagination.skip]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGalleries(true);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchGalleries]);

  const handleGalleryClick = (slug: string) => {
    const gallery = galleries.find(g => g.slug === slug);
    if (gallery) {
      setSelectedGallery(gallery);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGallery(null);
  };

  const handleBlockSuccess = () => {
    fetchGalleries(false);
  };

  const handlePageChange = (skip: number) => {
    setPagination((prev) => ({ ...prev, skip }));
  };

  return (
    <div className="">
      <div className="mb-6">
        <p className="text-base-content/70 mt-1">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <GalleryFilters
        filter={filter}
        onFilterChange={setFilter}
        totalGalleries={pagination.total}
      />

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-base-content/70">Loading galleries...</p>
        </div>
      ) : (
        <>
          <GalleryTable
            galleries={galleries}
            onGalleryClick={handleGalleryClick}
          />

          <GalleryPagination
            skip={pagination.skip}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <GalleryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        gallery={selectedGallery}
        onBlockSuccess={handleBlockSuccess}
      />
    </div>
  );
}
