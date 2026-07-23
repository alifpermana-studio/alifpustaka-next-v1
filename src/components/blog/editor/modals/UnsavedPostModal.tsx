import { FileText, FileClock, MoveRight, MoveLeft, Layers2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { EDITOR_CONSTANTS } from "@/constants/editor";
import { PostMetadata } from "apus-editor";

interface UnsavedPostModalProps {
  onClose: () => void;
  setMd: (md: string) => void;
  setMetadata: (metadata: PostMetadata) => void;
  setMessage: (message: string) => void;
}

export const UnsavedPostModal = ({
  onClose,
  setMd,
  setMetadata,
  setMessage,
}: UnsavedPostModalProps) => {
  const router = useRouter();

  const handleLocalOption = () => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem(EDITOR_CONSTANTS.STORAGE_KEY)
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
    localStorage.removeItem(EDITOR_CONSTANTS.STORAGE_KEY);
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
};
