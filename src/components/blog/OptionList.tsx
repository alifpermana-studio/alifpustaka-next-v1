import React, { useState } from "react";
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

  const handleCopy = (e: string) => {
    navigator.clipboard.writeText(`${baseURL}/api/image?${e}`).then(() => {
      setDropdownOpen(false);
    });
  };
  return (
    <>
      <div
        onClick={() => setDropdownOpen(true)}
        className="hover:bg-base-300/10 cursor-pointer rounded-full p-2 transition-colors duration-200 ease-in-out active:bg-gray-500 hover:dark:bg-gray-600 active:dark:bg-gray-500"
      >
        <EllipsisVertical />
      </div>
      <div className="relative">
        <Dropdown
          isOpen={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          className="shadow-theme-lg dark:bg-gray-dark absolute right-0 mt-1.5 flex w-65 flex-col rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800"
        >
          <ul className="flex flex-col gap-1 border-b border-gray-200 py-1 dark:border-gray-800">
            <li>
              <DropdownItem
                onItemClick={() => router.push(`/blog/preview/${post.slug}`)}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <Copy />
                Preview
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                onItemClick={() => handleCopy(`${post.slug}`)}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <Copy />
                Copy Link
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                onItemClick={() => router.push(`/blog/editor?key=${post.id}`)}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <Pencil />
                Edit
              </DropdownItem>
            </li>
            <li>
              <DropdownItem className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
                <Trash2 />
                Delete
              </DropdownItem>
            </li>
            <li>
              <DropdownItem className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
                <Bug />
                Report
              </DropdownItem>
            </li>
          </ul>
        </Dropdown>
      </div>
    </>
  );
};
