import { UserRole, UserStatus } from "@/types/roles";
import { Select } from "@/components/ui/Select";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface FilterState {
  search: string;
  role: UserRole | "";
  status: UserStatus | "";
}

interface UserFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  totalUsers: number;
}

export function UserFilters({ filter, onFilterChange, totalUsers }: UserFiltersProps) {
  const [searchInput, setSearchInput] = useState(filter.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filter, search: searchInput });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "super_admin", label: "Super Admin" },
    { value: "content_admin", label: "Content Admin" },
    { value: "user_admin", label: "User Admin" },
    { value: "sales_admin", label: "Sales Admin" },
    { value: "support_admin", label: "Support Admin" },
    { value: "editor", label: "Editor" },
    { value: "author", label: "Author" },
    { value: "user", label: "User" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "banned", label: "Banned" },
    { value: "deleted", label: "Deleted" },
  ];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 w-full rounded-xl border border-base-300 bg-base-200 pl-10 pr-4 text-sm text-base-content focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0"
          />
        </div>

        <div className="flex gap-3">
          <Select
            value={filter.role}
            onChange={(value) => onFilterChange({ ...filter, role: value as UserRole | "" })}
            options={roleOptions}
            className="w-40"
          />
          <Select
            value={filter.status}
            onChange={(value) => onFilterChange({ ...filter, status: value as UserStatus | "" })}
            options={statusOptions}
            className="w-40"
          />
        </div>
      </div>

      <div className="text-sm text-base-content/70">
        {totalUsers} user{totalUsers !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
