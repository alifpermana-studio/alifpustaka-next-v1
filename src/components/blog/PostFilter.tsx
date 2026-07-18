"use client";

import { usePost } from "@/context/PostContext";
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
import { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";

export const PostFilter = () => {
  return (
    <div className="text-base-content flex w-full flex-row items-center justify-between gap-10 py-2">
      <LayoutSelection />
      <FilterAndRefresh />
    </div>
  );
};

const LayoutSelection = () => {
  return (
    <div className="flex flex-row gap-1">
      <div
        className="hover:bg-base-content/10 cursor-pointer rounded-md p-1"
        title="Grid Layout"
      >
        <LayoutGrid className="" />
      </div>
      <div
        className="hover:bg-base-content/10 cursor-pointer rounded-md p-1"
        title="List Layout"
      >
        <Rows3 />
      </div>
    </div>
  );
};

const FilterAndRefresh = () => {
  const { refresh, loading, setFilter } = usePost();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");

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

  useEffect(() => {
    if (!searchKey) setFilter({ search: "" });
    const search = setTimeout(() => {
      setFilter({ search: searchKey });
    }, 1000);
    return () => clearTimeout(search);
  }, [searchKey]);

  return (
    <div className="flex w-full flex-row items-center justify-between gap-5">
      <div className="w-full">
        <Input
          className="w-full"
          id="search"
          name="search"
          placeholder="Find your post"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
      </div>
      <div className="flex flex-row gap-1">
        <button
          onClick={() => setDropdownOpen(true)}
          disabled={loading}
          className="hover:bg-base-content/10 cursor-pointer rounded-md p-1"
          title="Sort"
        >
          <FunnelPlus />
        </button>
        <button
          onClick={handleRefresh}
          className={`hover:bg-base-content/10 cursor-pointer rounded-full p-1 ${loading ? "animate-spin" : ""}`}
          title="Refresh"
        >
          <RotateCw />
        </button>
        <div className="relative">
          <Dropdown
            isOpen={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            className="shadow-theme-lg border-base-content/20 text-base-content bg-base-300 absolute right-0 mt-10 flex w-65 flex-col rounded-2xl border p-2"
          >
            <ul className="border-base-content/50 flex flex-col gap-1 border-b pb-1">
              <li>
                <DropdownItem
                  onClick={() => handleSort("title")}
                  className="group text-theme-sm hover:bg-base-content/10 flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                >
                  <ALargeSmall />
                  Title
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onClick={() => handleSort("slug")}
                  className="group text-theme-sm hover:bg-base-content/10 flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                >
                  <Link />
                  Slug
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onClick={() => handleSort("uploadTime")}
                  className="group text-theme-sm hover:bg-base-content/10 flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                >
                  <Clock />
                  Upload Time
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onClick={() => handleSort("size")}
                  className="group text-theme-sm hover:bg-base-content/10 flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                >
                  <Database />
                  Size
                </DropdownItem>
              </li>
            </ul>
            <ul className="flex flex-col gap-1 pt-1">
              <li>
                <DropdownItem
                  onClick={() => handleOrder("asc")}
                  className="group text-theme-sm hover:bg-base-content/10 flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                >
                  <ArrowDownWideNarrow />
                  Ascending
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onClick={() => handleOrder("desc")}
                  className="group text-theme-sm hover:bg-base-content/10 flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                >
                  <ArrowUpNarrowWide />
                  Descending
                </DropdownItem>
              </li>
            </ul>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};
