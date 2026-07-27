"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CloudUpload, Images, Link } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import { UploadImageCard } from "./UploadImageCard";
import { LinkImageCard } from "./LinkImageCard";
import { GalleryImageCard } from "./GalleryImageCard";

type Props = {
  onClose: () => void;
  setImg: Dispatch<SetStateAction<string>>;
};

const ImageCard = ({ onClose, setImg }: Props) => {
  const { refresh } = useGallery();
  const [option, setOption] = useState("upload");

  useEffect(() => {
    if (option === "gallery") {
      refresh();
    }
  }, [option]);
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <SelectOptions setOption={(val) => setOption(val)} />
      {option === "upload" && (
        <UploadImageCard onClose={onClose} setImg={setImg} />
      )}
      {option === "link" && <LinkImageCard onClose={onClose} setImg={setImg} />}
      {option === "gallery" && (
        <GalleryImageCard onClose={onClose} setImg={setImg} />
      )}
    </div>
  );
};

export default ImageCard;

const SelectOptions = ({
  setOption,
}: {
  setOption: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <div className="mx-auto grid grid-cols-3 items-center justify-center gap-3">
      <button
        className="flex flex-row flex-wrap items-center justify-center gap-3 rounded-lg bg-gray-300 px-4 py-2 text-gray-800 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100 dark:bg-gray-700 dark:text-gray-200"
        onClick={() => setOption("gallery")}
      >
        <Images />
        <span>Gallery</span>
      </button>
      <button
        className="flex flex-row flex-wrap items-center justify-center gap-3 rounded-lg bg-gray-300 px-4 py-2 text-gray-800 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100 dark:bg-gray-700 dark:text-gray-200"
        onClick={() => setOption("upload")}
      >
        <CloudUpload />
        <span>Upload</span>
      </button>
      <button
        className="flex flex-row flex-wrap items-center justify-center gap-3 rounded-lg bg-gray-300 px-4 py-2 text-gray-800 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100 dark:bg-gray-700 dark:text-gray-200"
        onClick={() => setOption("link")}
      >
        <Link />
        <span>Link</span>
      </button>
    </div>
  );
};
