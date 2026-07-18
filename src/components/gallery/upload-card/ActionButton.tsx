import { RefreshCw, Trash2, Upload } from 'lucide-react';

interface Props {
  setOnCancel: React.Dispatch<React.SetStateAction<boolean>>;
  isUploading: boolean;
  handleUpload: (e: React.FormEvent) => void;
}

export const ActionButton = ({ setOnCancel, isUploading, handleUpload }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-x-20 gap-y-5 lg:grid-cols-2">
      <button
        type="button"
        onClick={() => setOnCancel(true)}
        disabled={isUploading ? true : false}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-1 text-center text-lg font-semibold hover:bg-red-600 focus:bg-red-700 dark:text-white`}
      >
        <Trash2 />
        <span>Cancel</span>
      </button>
      <button
        type="submit"
        onClick={handleUpload}
        disabled={isUploading ? true : false}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-1 text-center text-lg font-semibold hover:bg-blue-600 focus:bg-blue-700 dark:text-white`}
      >
        {isUploading ? <RefreshCw className="animate-spin" /> : <Upload />}
        <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
      </button>
    </div>
  );
};