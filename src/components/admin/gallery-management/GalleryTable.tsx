import { GalleryTableRow } from "./GalleryTableRow";
import { Checkbox } from "@/components/ui/Checkbox";
import { useMemo } from "react";

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

interface GalleryTableProps {
  galleries: GalleryListItem[];
  selectedGalleries: Set<string>;
  onSelectGallery: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onGalleryClick: (slug: string) => void;
}

export function GalleryTable({
  galleries,
  selectedGalleries,
  onSelectGallery,
  onSelectAll,
  onGalleryClick,
}: GalleryTableProps) {
  const selectableGalleries = useMemo(() => {
    return galleries;
  }, [galleries]);

  const selectableCount = selectableGalleries.length;
  const isAllSelected = selectableCount > 0 && selectedGalleries.size === selectableCount;
  const isIndeterminate = selectedGalleries.size > 0 && selectedGalleries.size < selectableCount;
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-base-300 bg-base-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-base-300 bg-base-300/50">
            <th className="p-4 text-left">
              <Checkbox
                checked={isAllSelected}
                onChange={onSelectAll}
                indeterminate={isIndeterminate}
              />
            </th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Gallery</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Author</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Tags</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Updated</th>
            <th className="p-4 text-left text-sm font-semibold text-base-content">Actions</th>
          </tr>
        </thead>
        <tbody>
          {galleries.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-base-content/70">
                No galleries found
              </td>
            </tr>
          ) : (
            galleries.map((gallery) => (
              <GalleryTableRow
                key={gallery.id}
                gallery={gallery}
                isSelected={selectedGalleries.has(gallery.id)}
                onSelect={onSelectGallery}
                onClick={onGalleryClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
