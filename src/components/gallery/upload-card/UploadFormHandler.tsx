import { UploadImage } from "apus-gallery";
import { useEffect } from "react";
import UploadMetadata from "./UploadMetadata";
import { ActionButton } from "./ActionButton";
import { TriangleAlertIcon } from "lucide-react";

interface Props {
  isUploading: boolean;
  onCancel: boolean;
  uploadProgress: number;
  alert: string;
  handleUpload: (e: React.FormEvent) => void;
  imageData: UploadImage;
  setImageData: React.Dispatch<React.SetStateAction<UploadImage>>;
  setOnCancel: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UploadFormHandler = ({
  imageData,
  uploadProgress,
  onCancel,
  isUploading,
  alert,
  handleUpload,
  setOnCancel,
  setImageData,
}: Props) => {
  useEffect(() => {
    if (imageData.imageFile) {
      setOnCancel(false);
    }
  }, [imageData]);

  const preventKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`${onCancel ? "hidden" : "grid grid-cols-1"} items-start justify-start`}
    >
      <form
        onSubmit={handleUpload}
        className="grid gap-5"
        onKeyDown={preventKey}
      >
        <UploadMetadata imageData={imageData} setImageData={setImageData} />

        <div
          className={`-lg flex w-full items-center ${alert ? "flex" : "hidden"} justify-center gap-2 bg-red-700 px-4 py-1 text-center text-lg font-semibold dark:text-white`}
        >
          <TriangleAlertIcon/>
          <span>{alert}</span>
        </div>

        <div
          className={`mx-auto mt-2 w-full ${uploadProgress > 0 ? "flex flex-col items-center justify-center" : "hidden"}`}
        >
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="animate-pulsebar h-full bg-blue-500 transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            {uploadProgress}%
          </p>
        </div>
        <ActionButton
          setOnCancel={setOnCancel}
          isUploading={isUploading}
          handleUpload={handleUpload}
        />
      </form>
    </div>
  );
};
