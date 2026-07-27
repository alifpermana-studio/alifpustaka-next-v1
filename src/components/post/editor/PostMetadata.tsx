import Image from "next/image";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

import { X, Image as ImageIcon } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import ImageCard from "./ImageCard";
import { PostMetadata as PostMetadataType } from "apus-editor";
import { SPECIAL_CHAR_REGEX } from "@/constants/editor";

type Props = {
  formData: PostMetadataType;
  setFormData: Dispatch<SetStateAction<PostMetadataType>>;
};

export const PostMetadata = ({ formData, setFormData }: Props) => {
  const [tag, setTag] = useState("");
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      slug: formData.title
        .trim()
        .replaceAll(" ", "-")
        .replaceAll(SPECIAL_CHAR_REGEX, "")
        .replace(/(-)\1+/g, "$1")
        .toLowerCase(),
    }));
  }, [formData.title, setFormData]);

  const onChangeTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(",")) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTag(""); // Reset value if space is detected
    } else {
      setTag(value.replace(" ", "-")); // Otherwise, update the value normally
    }
  };

  const onChangeSlug = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!SPECIAL_CHAR_REGEX.test(value)) {
      setFormData((prev) => ({
        ...prev,
        slug: value.replaceAll(" ", "-"),
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission when Enter is pressed
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTag("");
    }
  };

  const deleteTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    })); // Using filter
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="grid w-full grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <Label>
              Title<span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              id="title"
              name="title"
              placeholder="Alif Pustaka Logo"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <Label>
              Slug<span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              id="slug"
              name="slug"
              placeholder="alif-pustaka-logo"
              value={formData.slug}
              onChange={onChangeSlug}
            />
          </div>

          <div>
            <Label>
              Tags
              <span className="italic">— separate tags with comma (",")</span>
            </Label>
            <Input
              type="text"
              id="tags"
              name="tags"
              placeholder="alif-pustaka"
              value={tag}
              onChange={onChangeTag}
              onKeyDown={handleKeyDown}
            />

            <div className="mt-3 flex flex-row flex-wrap gap-3">
              {formData.tags.map((tag, i) => (
                <div
                  key={i}
                  className="flex flex-row items-center justify-between overflow-hidden rounded-lg bg-blue-200 text-black"
                >
                  <span className="px-2 py-1">{tag}</span>
                  <button
                    type="button"
                    className="bg-blue-300 px-2 py-1 hover:bg-blue-400 focus:bg-blue-500"
                    onClick={() => deleteTag(tag)}
                  >
                    <X />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>
              <span className="text-transparent select-none">
                Your banner image here
              </span>
            </Label>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-500 px-4 py-2.5 font-semibold transition-transform duration-200 ease-in-out hover:scale-[102%] hover:bg-blue-400 focus:scale-[104%] focus:bg-blue-600"
              onClick={() => openModal()}
            >
              <ImageIcon />
              <span>Banner Image</span>
            </button>
          </div>
          <div className="lg:col-span-2">
            {formData.image ? (
              <Image
                src={formData.image}
                alt={formData.slug}
                width={300}
                height={300}
                className="aspect-video w-full object-contain"
              />
            ) : (
              <ImageIcon className="h-32 w-full" />
            )}
          </div>
          <div className="lg:col-span-2">
            <Label>
              Description<span className="text-error-500">*</span>
            </Label>
            <textarea
              className="field-sizing-content w-full resize-y rounded-xl border border-gray-600 bg-gray-900 p-4 font-mono text-sm text-gray-300 outline-none focus:border-indigo-400 focus:ring-indigo-500"
              id="desc"
              rows={2}
              name="desc"
              placeholder="This is where you highlight your content to public."
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
            />
          </div>
        </div>
      </form>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className={`no-scrollbar block max-w-5xl overflow-auto p-4`}
      >
        <ImageCard
          setImg={(val) =>
            setFormData((prev) => ({
              ...prev,
              image: val as string,
            }))
          }
          onClose={closeModal}
        />
      </Modal>
    </div>
  );
};
