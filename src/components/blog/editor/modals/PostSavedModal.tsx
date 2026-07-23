import {
  FileText,
  ChevronsRight,
  Save,
  CircleCheckBig,
  PenLine,
  SquareChartGantt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EditorMessage } from "apus-editor";
import { Dispatch, SetStateAction } from "react";

interface PostSavedModalProps {
  onClose: () => void;
  setAction: (action: string) => void;
  setMessage: Dispatch<SetStateAction<EditorMessage | "">>;
}

export const PostSavedModal = ({
  onClose,
  setAction,
  setMessage,
}: PostSavedModalProps) => {
  const router = useRouter();

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
};
