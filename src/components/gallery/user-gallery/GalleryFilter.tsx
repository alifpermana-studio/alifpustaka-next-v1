"use client";

import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useGallery } from "@/hooks/useGallery";
import {
  ALargeSmall,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Clock,
  Database,
  FunnelPlus,
  LayoutGrid,
  Link,
  RotateCw,
  Rows3,
} from "lucide-react";
import { useState } from "react";

export const GalleryFilter = () => {
  return (
    <div className="flex flex-row items-center justify-between py-2">
      <LayoutSelection />
      <FilterAndRefresh />
    </div>
  );
};

const LayoutSelection = () => {
  return (
    <div className="flex flex-row gap-1">
      <div
        className="cursor-pointer rounded-md p-1 hover:bg-blue-200/20"
        title="Grid Layout"
      >
        <LayoutGrid />
      </div>
      <div
        className="cursor-pointer rounded-md p-1 hover:bg-blue-200/20"
        title="List Layout"
      >
        <Rows3 />
      </div>
    </div>
  );
};

const FilterAndRefresh = () => {
  const { refresh, loading, setFilter } = useGallery();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRefresh = () => {
    refresh();
  };

  const handleSort = (sort: string) => {
    setFilter({ sort: sort });
    setDropdownOpen(false);
  };

  const handleOrder = (order: string) => {
    setFilter({ order: order });
    setDropdownOpen(false);
  };

  return (
    <div className="flex flex-row gap-1">
      <button
        onClick={() => setDropdownOpen(true)}
        disabled={loading}
        className="cursor-pointer rounded-md p-1 hover:bg-blue-200/20"
        title="Sort"
      >
        <FunnelPlus />
      </button>
      <button
        onClick={handleRefresh}
        className={`cursor-pointer rounded-full p-1 hover:bg-blue-200/20 ${loading ? "animate-spin" : ""}`}
        title="Refresh"
      >
        <RotateCw />
      </button>
      <div className="relative">
        <Dropdown
          isOpen={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          className="shadow-theme-lg dark:bg-gray-dark absolute right-0 mt-10 flex w-65 flex-col rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800"
        >
          <ul className="flex flex-col gap-1 border-b-4 border-gray-200 py-1 dark:border-gray-800">
            <li>
              <DropdownItem
                onClick={() => handleSort("title")}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <ALargeSmall />
                Title
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                onClick={() => handleSort("slug")}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <Link />
                Slug
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                onClick={() => handleSort("uploadTime")}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <Clock />
                Upload Time
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                onClick={() => handleSort("size")}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <Database />
                Size
              </DropdownItem>
            </li>
          </ul>
          <ul className="flex flex-col gap-1 border-b border-gray-200 py-1 dark:border-gray-800">
            <li>
              <DropdownItem
                onClick={() => handleOrder("asc")}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <ArrowDownWideNarrow />
                Ascending
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                onClick={() => handleOrder("desc")}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <ArrowUpNarrowWide />
                Descending
              </DropdownItem>
            </li>
          </ul>
        </Dropdown>
      </div>
    </div>
  );
};
