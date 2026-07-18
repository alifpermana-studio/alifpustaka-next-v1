import { FileInput, Trash2 } from "lucide-react";

interface Props {
  setOnCancel: React.Dispatch<React.SetStateAction<boolean>>;
  isUpdating: boolean;
}

export const ActionUpdate = ({ setOnCancel, isUpdating }: Props) => {
  return (
    <div className="flex flex-row items-end justify-center gap-10">
      <button
        type="button"
        onClick={() => setOnCancel(true)}
        disabled={isUpdating ? true : false}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-1 text-center text-lg font-semibold hover:bg-red-600 focus:bg-red-700 dark:text-white`}
      >
        <Trash2 />
        <span>Cancel</span>
      </button>
      <button
        type="submit"
        disabled={isUpdating ? true : false}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-1 text-center text-lg font-semibold hover:bg-blue-600 focus:bg-blue-700 dark:text-white`}
      >
        <FileInput />
        <span>{isUpdating ? "Updating..." : "Update"}</span>
      </button>
    </div>
  );
};
