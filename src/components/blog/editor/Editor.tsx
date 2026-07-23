"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";

import { PostMetadata } from "./PostMetadata";
import { ActionButton } from "./ActionButton";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { MarkdownEditor } from "./MarkdownEditor";
import { useRouter } from "next/navigation";
import { PostMetadata as PostMetadataType, EditorProps } from "apus-editor";
import { EDITOR_CONSTANTS } from "@/constants/editor";
import { UnsavedPostModal } from "./modals";

export default function Editor({
  postMd = "",
  postMetadata,
  onChange,
  storageKey,
}: EditorProps) {
  const [md, setMd] = useState(postMd);
  const [metadata, setMetadata] = useState<PostMetadataType>(
    postMetadata || {
      id: storageKey,
      title: "",
      slug: "",
      desc: "",
      tags: [],
      image: "",
    },
  );

  const { isOpen, openModal, closeModal } = useModal();
  const [message, setMessage] = useState<string>("");

  // Draft persistence (optional)
  useEffect(() => {
    if (!storageKey) return;
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(EDITOR_CONSTANTS.STORAGE_KEY) : null;
    if (saved && !postMd && !postMetadata) {
      const { md, metadata } = JSON.parse(saved);
      if (metadata.id !== storageKey && md !== "") {
        setMessage("mismatch-key-localStorage");
        openModal();
      } else {
        setMd(md);
        setMetadata(metadata);
      }
    }
  }, [storageKey, postMd, postMetadata, openModal]);

  useEffect(() => {
    if (!storageKey) return;
    const id = setTimeout(() => {
      localStorage.setItem(
        EDITOR_CONSTANTS.STORAGE_KEY,
        JSON.stringify({ md: md, metadata: metadata }),
      );
    }, EDITOR_CONSTANTS.AUTOSAVE_DELAY);
    return () => clearTimeout(id);
  }, [md, storageKey, metadata]);

  useEffect(() => {
    onChange?.(md);
  }, [md, onChange]);

  return (
    <div className="flex flex-col gap-4">
      <PostMetadata
        formData={metadata}
        setFormData={(val) => setMetadata(val)}
      />
      <MarkdownEditor content={postMd} md={md} setMd={setMd} />
      <ActionButton metadata={metadata} md={md} />
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className={`no-scrollbar block max-w-5xl overflow-auto p-4`}
      >
        {message === "mismatch-key-localStorage" && (
          <UnsavedPostModal
            onClose={closeModal}
            setMd={setMd}
            setMetadata={setMetadata}
            setMessage={setMessage}
          />
        )}
      </Modal>
    </div>
  );
}
