import { FileText, ChevronsRight, Trash } from "lucide-react";
import { EditorMessage } from "apus-editor";
import { Dispatch, SetStateAction } from "react";

interface DeleteConsentModalProps {
  onClose: () => void;
  onDelete: () => void;
  setAction: (action: string) => void;
  setMessage: Dispatch<SetStateAction<EditorMessage | "">>;
}

export const DeleteConsentModal = ({
  onClose,
  onDelete,
  setAction,
  setMessage,
}: DeleteConsentModalProps) => {
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
};
