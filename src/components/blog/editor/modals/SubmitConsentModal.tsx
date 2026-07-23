import { FileText, ChevronsRight, SearchCheck, Send } from "lucide-react";
import { EditorMessage } from "apus-editor";
import { Dispatch, SetStateAction } from "react";

interface SubmitConsentModalProps {
  onClose: () => void;
  onPublish: () => void;
  setAction: (action: string) => void;
  setMessage: Dispatch<SetStateAction<EditorMessage | "">>;
}

export const SubmitConsentModal = ({
  onClose,
  onPublish,
  setAction,
  setMessage,
}: SubmitConsentModalProps) => {
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
};
