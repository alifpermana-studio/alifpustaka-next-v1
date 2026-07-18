"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";

import { PostMetadata } from "./PostMetadata";
import { ActionButton } from "./ActionButton";
import {
  FileClock,
  FileText,
  Layers2,
  MoveLeft,
  MoveRight,
} from "lucide-react";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { MarkdownEditor } from "./MarkdownEditor";
import { useRouter } from "next/navigation";

type MarkdownEditorProps = {
  postMd?: string;
  postMetadata?: MetadataType;
  onChange?: (md: string) => void;
  className?: string;
  storageKey: string; // optional localStorage key for draft persistence
};

// 2. Define a custom type that matches the props passed to the 'code' component
/* interface CustomCodeProps extends React.ComponentPropsWithoutRef<'code'> {
  node: any; // Node is always passed by ReactMarkdown
  inline: boolean; // Crucial property for differentiating inline vs. block
} */

type MetadataType = {
  id: string;
  title: string;
  slug: string;
  image: string;
  tags: string[];
  desc: string;
};

export default function Editor({
  postMd = "",
  postMetadata,
  onChange,
  storageKey,
}: MarkdownEditorProps) {
  const [md, setMd] = useState(postMd);
  const [metadata, setMetadata] = useState<MetadataType>(
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
      typeof window !== "undefined" ? localStorage.getItem("apus-post") : null;
    if (saved && !postMd && !postMetadata) {
      const { md, metadata } = JSON.parse(saved);
      if (metadata.id !== storageKey && md !== "") {
        setMessage("msimatch-key-localStorage");
        openModal();
      } else {
        setMd(md);
        setMetadata(metadata);
      }
    }
  }, [storageKey, postMd, postMetadata]);

  useEffect(() => {
    if (!storageKey) return;
    const id = setTimeout(() => {
      localStorage.setItem(
        "apus-post",
        JSON.stringify({ md: md, metadata: metadata }),
      );
    }, 30000);
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
        <PopUpMessage
          message={message}
          setMessage={setMessage}
          onClose={closeModal}
          setMd={setMd}
          setMetadata={setMetadata}
        />
      </Modal>
    </div>
  );
}

type PopUpProps = {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  onClose: () => void;
  setMd: Dispatch<SetStateAction<string>>;
  setMetadata: Dispatch<SetStateAction<MetadataType>>;
};

const PopUpMessage = ({
  message,
  setMessage,
  onClose,
  setMd,
  setMetadata,
}: PopUpProps) => {
  const router = useRouter();
  if (message === "msimatch-key-localStorage") {
    const handleLocalOption = () => {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("apus-post")
          : null;

      if (saved) {
        const { md, metadata } = JSON.parse(saved);
        setMd(md);
        setMetadata(metadata);
      }
      setMessage("");
      onClose();
    };

    const handleNewOption = () => {
      localStorage.removeItem("apus-post");
      setMessage("");
      onClose();
      router.push("/blog/editor");
    };

    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-800 dark:text-gray-200">
        <span className="flex items-center justify-center gap-8">
          <FileText className="h-20 w-20" />
          <MoveRight className="h-10 w-10" />
          <Layers2 className="h-20 w-20" />
          <MoveLeft className="h-10 w-10" />
          <FileClock className="h-20 w-20" />
        </span>
        <div className="text-2xl font-semibold">We found unsaved post.</div>
        <div className="text-xl">
          <p>
            We found unsaved post on your local browser. Please decide to load
            unsaved post or create new post.
          </p>
        </div>
        <div className="mt-4 flex w-3/4 flex-row justify-center gap-10">
          <button
            onClick={handleNewOption}
            className="flex flex-row gap-3 rounded-xl bg-blue-700 px-4 py-2 text-gray-200 hover:bg-blue-800 focus:bg-blue-600"
          >
            <span>New Post</span>
            <span>
              <FileText />
            </span>
          </button>
          <button
            onClick={handleLocalOption}
            className="flex flex-row gap-3 rounded-xl bg-blue-700 px-4 py-2 text-gray-200 hover:bg-blue-800 focus:bg-blue-600"
          >
            <span>Open Saved Post</span>
            <span>
              <FileClock />
            </span>
          </button>
        </div>
      </div>
    );
  }
};
