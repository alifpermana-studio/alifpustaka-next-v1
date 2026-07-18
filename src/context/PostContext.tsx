"use client"; // if you’re in Next.js App Router

import { ImageFilter } from "apus-gallery";
import { Post, PostFilter } from "apus-post";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

type PostContextType = {
  data: Post[];
  loading: boolean;
  error: string | null;
  filter: PostFilter;
  setFilter: (patch: Partial<PostFilter>) => void;
  refresh: () => void;
};

const PostContext = createContext<PostContextType | null>(null);

const initial: PostFilter = {
  sort: "uploadTime",
  order: "asc",
  search: "",
  max: 20,
  skip: 0,
};

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<Post[]>([]);
  const [filter, _setFilter] = useState<PostFilter>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // manual refresh trigger
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const setFilter = useCallback((patch: Partial<ImageFilter>) => {
    _setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  // key for deps (avoids infinite loops)
  const filtersKey = useMemo(() => JSON.stringify(filter), [filter]);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/post-list?sort=${filter.sort}&order=${filter.order}${filter.search ? `&search=${filter.search}` : ""}&skip=${filter.skip}&max=${filter.max}`,
        {
          method: "GET",
        },
      );

      const { success, message, data, error } = await res.json();

      if (success) {
        setData(data ?? []);
        console.log("hooks post check: ", data);
      } else {
        setError(error ?? message ?? "Failed to load posts");
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
    if (tick) fetchPost();
  }, [filtersKey, tick, fetchPost]);

  return (
    <PostContext.Provider
      value={{ data, loading, error, filter, setFilter, refresh }}
    >
      {children}
    </PostContext.Provider>
  );
};

// Custom hook
export const usePost = () => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePost must be used inside <PostProvider>");
  return ctx;
};
