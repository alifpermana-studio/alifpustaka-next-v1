"use client";

import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Modal } from "@/components/ui/modal";
import { ImageGallery } from "apus-gallery";
import {
  ArrowLeftFromLine,
  Bug,
  Copy,
  EllipsisVertical,
  Lock,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { UpdateMetadata } from "./UpdateMetadata";
import { ActionUpdate } from "./ActionUpdate";
import { useModal } from "@/hooks/useModal";
import { deleteImage, updateImage } from "@/lib/R2ImageHandler";
import { useGallery } from "@/hooks/useGallery";
import ImageModal from "./ImageModal";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export const GridLayout = () => {
  const { data, loading } = useGallery();
  const [imgList, setImgList] = useState<ImageGallery[]>([]);

  /* useEffect(() => {
    console.log('loading Check: ', loading);
    if (!loading) {
      console.log('imgList Check: ', imgList);
      setImgList(data);
    }
  }, [loading]); */

  useEffect(() => {
    if (!loading) {
      setImgList(data);
    }
  }, [loading]);

  return (
    <div className="grid w-full grid-cols-1 justify-center gap-3 rounded-md md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {imgList.map((image, i) => (
        <BoxImage key={i} image={image} />
      ))}
    </div>
  );
};

interface PropsBoxImage {
  image: ImageGallery;
}

const BoxImage = ({ image }: PropsBoxImage) => {
  const [hover, setHover] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isImageOpen,
    openModal: openImage,
    closeModal: closeImage,
  } = useModal();
  const dropdownTriggerRef = useRef<HTMLDivElement>(null);

  const openItem = (e: string) => {
    openModal();
    setModalType(e);
    setDropdownOpen(false);
  };

  const handleCopy = (e: string) => {
    navigator.clipboard.writeText(`${baseURL}/api/image?${e}`).then(() => {
      setDropdownOpen(false);
    });
  };

  const handleImageDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(true);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative rounded-md"
    >
      <div className="relative aspect-3/2 cursor-pointer overflow-hidden rounded-md">
        <Image
          className={`h-full w-full object-cover transition-all duration-500 ease-in-out ${hover && "scale-110"}`}
          src={`/api/image?src=${image.slug}&p=${image.isPrivate}`}
          alt="thumbnail"
          width={240}
          height={108}
          quality={25}
          unoptimized
          onClick={() => openImage()}
        />
        <div
          onClick={() => openImage()}
          className="bg-accent/40 text-accent-content absolute bottom-0 flex w-full items-center justify-between p-2 font-semibold backdrop-blur-md"
        >
          <p
            title={image.title}
            className={`transition-all duration-500 ease-in-out ${hover ? "overflow-hidden text-clip whitespace-normal" : "overflow-hidden text-ellipsis whitespace-nowrap"}`}
          >
            {image.title}
          </p>

          <div ref={dropdownTriggerRef}>
            <EllipsisVertical
              onClick={(e) => handleImageDropdown(e)}
              className="h-7 w-7 rounded-full p-1 hover:bg-gray-400/50"
            />
          </div>
        </div>
        <div
          className={`bg-accent absolute top-1 right-1 rounded-lg px-1 py-1 opacity-80 ${image.isPrivate ? "flex" : "hidden"}`}
        >
          <Lock className="text-accent-content" />
        </div>
      </div>
      <Dropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        triggerRef={dropdownTriggerRef}
        className="shadow-theme-lg bg-accent flex w-65 flex-col rounded-xl p-2"
      >
        <ul className="text-accent-content flex flex-col gap-1">
          <li>
            <DropdownItem
              onItemClick={() =>
                handleCopy(`p=${image.isPrivate}&src=${image.slug}`)
              }
              className="group text-theme-sm hover:bg-accent hover:text-accent-content/80 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium"
            >
              <Copy />
              Copy Link
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => openItem("edit")}
              className="group text-theme-sm hover:bg-accent hover:text-accent-content/80 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium"
            >
              <Pencil />
              Edit
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => openItem("delete")}
              className="group text-theme-sm hover:bg-accent hover:text-accent-content/80 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium"
            >
              <Trash2 />
              Delete
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => openItem("report")}
              className="group text-theme-sm hover:bg-accent hover:text-accent-content/80 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium"
            >
              <Bug />
              Report
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
      <Modal isOpen={isOpen} onClose={closeModal} className={`block max-w-5xl`}>
        {modalType === "edit" && (
          <EditModal image={image} closeModal={closeModal} />
        )}
        {modalType === "delete" && (
          <DeleteModal image={image} closeModal={closeModal} />
        )}
        {modalType === "report" && (
          <ReportModal image={image} closeModal={closeModal} />
        )}
      </Modal>
      <ImageModal
        isOpen={isImageOpen}
        onClose={closeImage}
        src={`/api/image?p=${image.isPrivate}&src=${image.slug}`}
        alt="image"
      />
    </div>
  );
};

interface EditModalProps {
  image: ImageGallery;
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditModal = ({ image, closeModal }: EditModalProps) => {
  const [alert, setAlert] = useState("");
  const [isUpdating, setIsupdating] = useState(false);
  const [editData, setEditData] = useState({
    title: image.title,
    slug: image.slug.substring(0, image.slug.lastIndexOf(".")),
    oldSlug: image.slug.substring(0, image.slug.lastIndexOf(".")),
    isPrivate: image.isPrivate,
    oldIsPrivate: image.isPrivate,
    id: image.id,
    size: image.size,
    isFeatured: image.isFeatured,
    format: getExtension(image.slug),
    uploadTime: image.uploadTime,
    tags: image.tags,
    path: image.path,
  });

  const { refresh } = useGallery();

  const preventKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update param: ", editData);
    setIsupdating(true);
    try {
      const { success, message, data, error } = await updateImage(editData);

      if (success) {
        console.log("Success update: ", data);
        closeModal(true);
        refresh();
      } else {
        console.log("Error update image: ", error);
        setAlert(message);
      }
    } catch (error) {
      console.log("Error update image: ", error);
    } finally {
      setIsupdating(false);
    }
  };
  return (
    <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit {image.title}
        </h4>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex items-center justify-center p-2">
          <Image
            src={`/api/image?p=${image.isPrivate}&src=${image.slug}`}
            alt="Upload Image"
            width={600}
            height={600}
            className="max-h-[80svh] w-full object-contain"
          />
        </div>
        <form
          onSubmit={handleUpdate}
          className="flex flex-col gap-10"
          onKeyDown={preventKey}
        >
          <UpdateMetadata editData={editData} setEditData={setEditData} />

          <div
            className={`flex w-full items-center ${alert ? "flex" : "hidden"} justify-center gap-2 bg-red-700 px-4 py-1 text-center text-lg font-semibold dark:text-white`}
          >
            <AlertTriangleIcon />
            <span>{alert}</span>
          </div>
          <ActionUpdate setOnCancel={closeModal} isUpdating={isUpdating} />
        </form>
      </div>
    </div>
  );
};

interface DeleteModalProps {
  image: ImageGallery;
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteModal = ({ image, closeModal }: DeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { refresh } = useGallery();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const { success, message, data, error } = await deleteImage(image);
      if (success) {
        setIsDeleting(false);
        closeModal(true);
        refresh();
        console.log(message, data);
      } else {
        setIsDeleting(false);
        console.log(message, error);
      }
    } catch (error) {
      setIsDeleting(false);
      console.log("Error delete image: ", error);
    }
  };

  return (
    <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Delete {image.title}
        </h4>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 text-2xl lg:flex-row">
        <div className="flex items-center justify-center p-2">
          <Image
            src={`/api/image?p=${image.isPrivate}&src=${image.slug}`}
            alt="Upload Image"
            width={100}
            height={100}
            className="max-h-[80svh] w-full object-contain"
          />
        </div>
        <div className="flex flex-col items-center gap-4">
          <p>
            Are you sure you want to delete image{" "}
            <span className="font-bold dark:text-blue-500">{image.slug}</span>?
          </p>
          <div className="flex flex-row items-end justify-center gap-10">
            <button
              type="button"
              onClick={() => closeModal(true)}
              disabled={isDeleting ? true : false}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-1 text-center font-semibold hover:bg-blue-600 focus:bg-blue-700 dark:text-white`}
            >
              <ArrowLeftFromLine />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isDeleting ? true : false}
              onClick={handleDelete}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-1 text-center font-semibold hover:bg-red-600 focus:bg-red-700 dark:text-white`}
            >
              <Trash2 />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportModal = ({ closeModal }: EditModalProps) => {
  return (
    <div>
      <button onClick={() => closeModal(true)}>Close Modal</button>
    </div>
  );
};

const getExtension = (fileName: string) => {
  if (!fileName.includes(".")) return ""; // no dot → no extension
  return "." + fileName.split(".").pop(); // returns ".jpg"
};
