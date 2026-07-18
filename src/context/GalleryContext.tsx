"use client"; // if you’re in Next.js App Router

import { getImageList } from "@/lib/R2ImageHandler";
import { ImageFilter, ImageGallery } from "apus-gallery";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

type GalleryContextType = {
  data: ImageGallery[];
  loading: boolean;
  dataVersion: number;
  error: string | null;
  filter: ImageFilter;
  setFilter: (patch: Partial<ImageFilter>) => void;
  isGrid: boolean;
  setIsGrid: (v: boolean) => void;
  refresh: () => void;
};

export const GalleryContext = createContext<GalleryContextType | null>(null);

const initial: ImageFilter = {
  sort: "uploadTime",
  order: "asc",
  search: "",
  max: 20,
  skip: 0,
};

export const GalleryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<ImageGallery[]>([]);
  const [filter, _setFilter] = useState<ImageFilter>(initial);
  const [isGrid, setIsGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  // manual refresh trigger
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const setFilter = useCallback((patch: Partial<ImageFilter>) => {
    _setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  // key for deps (avoids infinite loops)
  const filtersKey = useMemo(() => JSON.stringify(filter), [filter]);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getImageList(filter);

      if (res.success) {
        setData(res.data.images);
        setDataVersion((v) => v + 1);
        console.log("hooks check: ", res.data);
      } else {
        setError(res.error ?? res.message ?? "Failed to load images");
        setData([]);
      }
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (tick) fetchImages();
  }, [filtersKey, tick, fetchImages]);
  return (
    <GalleryContext.Provider
      value={{
        data,
        dataVersion,
        loading,
        error,
        filter,
        setFilter,
        isGrid,
        setIsGrid,
        refresh,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};
