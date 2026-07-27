import { FileText, ChevronsRight, SearchX } from "lucide-react";
import { EditorMessage } from "apus-editor";
import { Dispatch, SetStateAction } from "react";

interface DeleteFailedModalProps {
  onClose: () => void;
  setAction: (action: string) => void;
  setMessage: Dispatch<SetStateAction<EditorMessage | "">>;
}

export const DeleteFailedModal = ({
  onClose,
  setAction,
  setMessage,
}: DeleteFailedModalProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-800 dark:text-gray-200">
      <span className="flex gap-8">
        <FileText className="h-20 w-20" />
        <ChevronsRight className="h-20 w-20" />
        <SearchX className="h-20 w-20" />
      </span>
      <div className="text-2xl font-semibold">Failed to delete post</div>
      <div className="text-xl">
        <p>An error occurred while deleting your post. Please try again.</p>
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
          <span>Close</span>
        </button>
      </div>
    </div>
  );
};
