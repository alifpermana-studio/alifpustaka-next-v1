import { UploadImage } from "apus-gallery";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface Props {
  imageData: UploadImage;
  inputOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputOnDrop?: (e: React.DragEvent<HTMLLabelElement>) => void;
  onCancelInput?: (e: React.MouseEvent<HTMLInputElement>) => void;
}

export const ImageInputField = ({
  imageData,
  inputOnChange,
  inputOnDrop,
  onCancelInput,
}: Props) => {
  return (
    <div className="relative">
      <label
        className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-[3px] border-dashed border-gray-400"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={inputOnDrop}
      >
        <input
          title="input-image"
          required
          type="file"
          hidden
          accept="image/*"
          onChange={inputOnChange}
          onClick={onCancelInput}
        />

        <div className="aspect-h-3 aspect-w-4 relative w-full">
          {imageData.localPath ? (
            <Image
              src={imageData.localPath}
              alt="Upload Image"
              width={600}
              height={270}
              className="max-h-[65svh] w-full object-contain"
            />
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-3 px-4 py-2">
              <ImageIcon className="w-48 h-48 opacity-60" />
              <div className="text-center dark:text-white">
                Drop your image or click here to browse.
              </div>
            </div>
          )}
        </div>
      </label>
    </div>
  );
};
