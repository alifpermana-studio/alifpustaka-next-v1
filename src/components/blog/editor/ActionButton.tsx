import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import {
  ChevronsRight,
  CircleCheckBig,
  FileText,
  PenLine,
  Save,
  SearchCheck,
  SearchX,
  Send,
  SquareChartGantt,
  ThumbsUp,
  Trash,
  WholeWord,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

type Props = {
  metadata: MetadataType;
  md: string;
};

type MetadataType = {
  id: string;
  title: string;
  slug: string;
  image: string;
  tags: string[];
  desc: string;
};

export const ActionButton = ({ metadata, md }: Props) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("");
  const [message, setMessage] = useState("");
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
          action: "drafted",
        }),
      });

      const { message, success, data, error } = await reqPost.json();

      if (success) {
        console.log("Saving post success: ", { message, ...data });
        setAction("post-saved");
      } else {
        if (error === "missing-required-metadata") {
          setAction(error);
        }
        console.log("Error save post: ", error);
      }
    } catch (err) {
      console.log("Error fetch post: ", err);
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
          action: "submitted",
        }),
      });

      const { message, success, data, error } = await reqPost.json();

      if (success) {
        console.log("Submit post success: ", { message, ...data });
        localStorage.removeItem("apus-post");
        router.push("/blog");
      } else {
        if (error === "missing-required-metadata") {
          setAction(error);
        }
        console.log("Error submit post: ", error);
      }
    } catch (err) {
      console.log("Error fetch post: ", err);
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
          action: "deleted",
        }),
      });

      const { message, success, data, error } = await reqPost.json();

      if (success) {
        console.log("Delete post success: ", { message, ...data });
      } else {
        if (error === "missing-required-metadata") {
          setAction(error);
        }
        console.log("Error submit post: ", error);
      }
    } catch (err) {
      console.log("Error fetch post: ", err);
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
        <PopUpMessage
          message={message}
          setMessage={setMessage}
          setAction={setAction}
          onClose={closeModal}
          onDelete={handleDeletePost}
          onPublish={handlePublish}
        />
      </Modal>
    </div>
  );
};

type PopUpProps = {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  setAction: Dispatch<SetStateAction<string>>;
  onClose: () => void;
  onDelete: () => void;
  onPublish: () => void;
};

const PopUpMessage = ({
  message,
  setMessage,
  setAction,
  onClose,
  onDelete,
  onPublish,
}: PopUpProps) => {
  const router = useRouter();
  if (message === "submit-consent") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-800 dark:text-gray-200">
        <span className="flex gap-8">
          <FileText className="h-20 w-20" />
          <ChevronsRight className="h-20 w-20" />
          <SearchCheck className="h-20 w-20" />
        </span>
        <div className="text-2xl font-semibold">Ready to submit?.</div>
        <div className="text-xl">
          <p>
            Once you submit your post, we will review your post before we
            officially accept it to publish.
          </p>
        </div>
        <div className="mt-4 flex w-3/4 flex-row justify-center gap-10">
          <button
            onClick={() => {
              setAction("");
              setMessage("");
              onPublish();
              onClose();
            }}
            className="flex flex-row gap-3 rounded-xl bg-blue-700 px-4 py-2 text-gray-200 hover:bg-blue-800 focus:bg-blue-600"
          >
            <span>Process Submit</span>
            <span>
              <Send />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (message === "delete-consent") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-800 dark:text-gray-200">
        <span className="flex gap-8">
          <FileText className="h-20 w-20" />
          <ChevronsRight className="h-20 w-20" />
          <Trash className="h-20 w-20" />
        </span>
        <div className="text-2xl font-semibold">Delete your post</div>
        <div className="text-xl">
          <p>
            Are you sure you want to delete post? You can recover your deleted
            post from trash later.
          </p>
        </div>
        <div className="mt-4 flex w-3/4 flex-row justify-center gap-10">
          <button
            onClick={() => {
              setAction("");
              setMessage("");
              onDelete();
              onClose();
            }}
            className="flex flex-row gap-3 rounded-xl bg-red-700 px-4 py-2 text-gray-200 hover:bg-red-800 focus:bg-red-600"
          >
            <span>Process Delete</span>
            <span>
              <Trash />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (message === "missing-required-metadata") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-800 dark:text-gray-200">
        <span className="flex gap-8">
          <WholeWord className="h-20 w-20" />
          <ChevronsRight className="h-20 w-20" />
          <SearchX className="h-20 w-20" />
        </span>
        <div className="text-2xl font-semibold">Missing required metadata.</div>
        <div className="text-xl">
          <p>The title and slug parameters are required.</p>
        </div>
        <div className="mt-4 flex w-3/4 flex-row justify-center gap-10">
          <button
            onClick={() => {
              setAction("");
              setMessage("");
              onClose();
            }}
            className="flex flex-row gap-3 rounded-xl bg-blue-700 px-4 py-2 text-gray-200 hover:bg-blue-800 focus:bg-blue-600"
          >
            <span>I understand</span>
            <span>
              <ThumbsUp />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (message === "post-saved") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-800 dark:text-gray-200">
        <span className="flex gap-8">
          <FileText className="h-20 w-20" />
          <ChevronsRight className="h-20 w-20" />
          <Save className="h-20 w-20" />
          <ChevronsRight className="h-20 w-20" />
          <CircleCheckBig className="h-20 w-20" />
        </span>
        <div className="text-2xl font-semibold">Your post saved.</div>
        <div className="text-xl">
          <p>You can safely leave this page or continue editing.</p>
        </div>
        <div className="mt-4 flex w-3/4 flex-row justify-center gap-10">
          <button
            onClick={() => {
              setAction("");
              setMessage("");
              onClose();
            }}
            className="flex flex-row gap-3 rounded-xl bg-blue-700 px-4 py-2 text-gray-200 hover:bg-blue-800 focus:bg-blue-600"
          >
            <span>Continue editing</span>
            <span>
              <PenLine />
            </span>
          </button>
          <button
            onClick={() => {
              router.push("/blog");
            }}
            className="flex flex-row gap-3 rounded-xl bg-blue-700 px-4 py-2 text-gray-200 hover:bg-blue-800 focus:bg-blue-600"
          >
            <span>Back to Overview</span>
            <span>
              <SquareChartGantt />
            </span>
          </button>
        </div>
      </div>
    );
  }
};
