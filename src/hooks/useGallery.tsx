import { GalleryContext } from "@/context/GalleryContext";
import { useContext } from "react";

export const useGallery = () => {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be used inside <GalleryProvider>");
  return ctx;
};
