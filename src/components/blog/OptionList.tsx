import React, { useRef, useState } from "react";
import { Post } from "apus-post";
import { EllipsisVertical, Copy, Pencil, Trash2, Bug } from "lucide-react";

import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useRouter } from "next/navigation";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

type Props = {
  post: Post;
};

export const OptionList = ({ post }: Props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const dropdownTriggerRef = useRef<HTMLDivElement>(null);

  const handleCopy = (e: string) => {
    navigator.clipboard.writeText(`${baseURL}/api/image?${e}`).then(() => {
      setDropdownOpen(false);
    });
  };
  return (
    <div className="relative" ref={dropdownTriggerRef}>
      <div
        onClick={() => setDropdownOpen(true)}
        className="hover:bg-base-300/10 cursor-pointer rounded-full p-2 transition-colors duration-200 ease-in-out active:bg-gray-500 hover:dark:bg-gray-600 active:dark:bg-gray-500"
      >
        <EllipsisVertical />
      </div>

      <Dropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        triggerRef={dropdownTriggerRef}
        className="shadow-theme-lg bg-accent flex w-65 flex-col rounded-2xl p-2"
      >
        <ul className="flex flex-col gap-1 py-1">
          <li>
            <DropdownItem
              onItemClick={() => router.push(`/blog/preview/${post.slug}`)}
              className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
            >
              <Copy />
              Preview
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => handleCopy(`${post.slug}`)}
              className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
            >
              <Copy />
              Copy Link
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => router.push(`/blog/editor?key=${post.id}`)}
              className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
            >
              <Pencil />
              Edit
            </DropdownItem>
          </li>
          <li>
            <DropdownItem className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700">
              <Trash2 />
              Delete
            </DropdownItem>
          </li>
          <li>
            <DropdownItem className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700">
              <Bug />
              Report
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
};
