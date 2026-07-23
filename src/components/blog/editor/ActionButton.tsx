import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { Save, Send, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PostMetadata, EditorMessage } from "apus-editor";
import { EDITOR_CONSTANTS, EDITOR_ACTIONS } from "@/constants/editor";
import {
  SubmitConsentModal,
  DeleteConsentModal,
  MissingMetadataModal,
  PostSavedModal,
  DeleteFailedModal,
} from "./modals";

type Props = {
  metadata: PostMetadata;
  md: string;
};

export const ActionButton = ({ metadata, md }: Props) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("");
  const [message, setMessage] = useState<EditorMessage | "">("");
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    if (action === "submit") {
      setMessage("submit-consent");
      openModal();
    }
    if (action === "delete") {
      setMessage("delete-consent");
      openModal();
    }
    if (action === "save") {
      handleSaveDraft();
    }

    if (action === "missing-required-metadata") {
      setMessage(action);
      openModal();
    }

    if (action === "post-saved") {
      setMessage(action);
      openModal();
    }
  }, [action]);

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const reqPost = await fetch("/api/blog-post", {
        method: "PUT",
        body: JSON.stringify({
          data: { ...metadata, md: md },
          action: EDITOR_ACTIONS.DRAFTED,
        }),
      });

      const { message, success, data, error } = await reqPost.json();

      if (success) {
        setAction("post-saved");
      } else {
        if (error === "missing-required-metadata") {
          setAction(error);
        }
      }
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const reqPost = await fetch("/api/blog-post", {
        method: "PUT",
        body: JSON.stringify({
          data: { ...metadata, md: md },
          action: EDITOR_ACTIONS.SUBMITTED,
        }),
      });

      const { message, success, data, error } = await reqPost.json();

      if (success) {
        localStorage.removeItem(EDITOR_CONSTANTS.STORAGE_KEY);
        router.push("/blog");
      } else {
        if (error === "missing-required-metadata") {
          setAction(error);
        }
      }
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      setLoading(true);
      const reqPost = await fetch("/api/blog-post", {
        method: "PUT",
        body: JSON.stringify({
          data: { ...metadata, md: md },
          action: EDITOR_ACTIONS.DELETED,
        }),
      });

      const { message, success, data, error } = await reqPost.json();

      if (success) {
        localStorage.removeItem(EDITOR_CONSTANTS.STORAGE_KEY);
        router.push("/blog?message=post-deleted");
      } else {
        setAction("delete-failed");
        setMessage("delete-failed");
        openModal();
      }
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full grid-cols-1 gap-3 bg-gray-200 text-gray-800 lg:grid-cols-3 dark:bg-gray-800 dark:text-gray-200">
      <button
        onClick={() => setAction("delete")}
        disabled={loading}
        className={`${loading ? "opacity-90" : "opacity-100"} flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xl font-semibold text-white hover:bg-red-400 focus:bg-red-600`}
      >
        <Trash />
        <span>{action === "delete" ? "deleting..." : "Delete"}</span>
      </button>
      <button
        onClick={() => setAction("save")}
        disabled={loading}
        className={`${loading ? "opacity-90" : "opacity-100"} flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xl font-semibold text-white hover:bg-blue-400 focus:bg-blue-600`}
      >
        <Save />
        <span>{action === "save" ? "saving..." : "Save Draft"}</span>
      </button>
      <button
        onClick={() => setAction("submit")}
        disabled={loading}
        className={`${loading ? "opacity-90" : "opacity-100"} flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xl font-semibold text-white hover:bg-blue-400 focus:bg-blue-600`}
      >
        <Send />
        <span>{action === "submit" ? "publishing..." : "Publish"}</span>
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setAction("");
        }}
        className={`no-scrollbar block max-w-5xl overflow-auto p-4`}
      >
        {message === "submit-consent" && (
          <SubmitConsentModal
            onClose={closeModal}
            onPublish={handlePublish}
            setAction={setAction}
            setMessage={setMessage}
          />
        )}
        {message === "delete-consent" && (
          <DeleteConsentModal
            onClose={closeModal}
            onDelete={handleDeletePost}
            setAction={setAction}
            setMessage={setMessage}
          />
        )}
        {message === "missing-required-metadata" && (
          <MissingMetadataModal
            onClose={closeModal}
            setAction={setAction}
            setMessage={setMessage}
          />
        )}
        {message === "post-saved" && (
          <PostSavedModal
            onClose={closeModal}
            setAction={setAction}
            setMessage={setMessage}
          />
        )}
        {message === "delete-failed" && (
          <DeleteFailedModal
            onClose={closeModal}
            setAction={setAction}
            setMessage={setMessage}
          />
        )}
      </Modal>
    </div>
  );
};
