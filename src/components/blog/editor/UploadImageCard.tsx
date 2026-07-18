import { ImageInputField } from "@/components/gallery/upload-card/ImageInputField";
import { UploadFormHandler } from "@/components/gallery/upload-card/UploadFormHandler";
import {
  getR2PresignedURL,
  updateImage,
  uploadImage,
} from "@/lib/R2ImageHandler";
import { UploadImage } from "apus-gallery";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface progressFallbackType {
  message: string;
  progress: number;
  error: string | null;
}

type Props = {
  onClose: () => void;
  setImg: Dispatch<SetStateAction<string>>;
};

export const UploadImageCard = ({ onClose, setImg }: Props) => {
  const [alert, setAlert] = useState("");

  const imageBoilerplate: UploadImage = {
    title: "",
    imageFile: null,
    localPath: "",
    path: "/user",
    format: "",
    slug: "",
    size: 0,
    type: "",
    tags: [],
    uploadTime: "",
    ownerUsername: "",
  };

  const [imageData, setImageData] = useState<UploadImage>(imageBoilerplate);
  const [isUploading, setIsUploading] = useState(false);
  const [onCancel, setOnCancel] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (onCancel) {
      setImageData(imageBoilerplate);
    }
  }, [onCancel]);

  const handleInputOnDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const file = e.dataTransfer.files[0];
      const binaryData: any = [];
      binaryData.push(file);
      if (file) {
        if (file.size <= 2000000) {
          //Blob Type
          /* const myBlob = new Blob([file], {
            type: file.type,
          }); */

          setImageData((prev: any) => ({
            ...prev,
            size: file.size,
            imageFile: file,
            type: file.type,
            format: getExtension(file.name),
            localPath: URL.createObjectURL(new Blob([file], { type: "file" })),
          }));
        } else {
          setAlert("Maximum image size is 2MB.");
          setTimeout(() => setAlert(""), 5000);
        }
      } else {
        setAlert("Image input invalid.");
        setTimeout(() => setAlert(""), 5000);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      if (
        !imageData.imageFile ||
        !imageData.path ||
        !imageData.slug ||
        !imageData.title
      ) {
        setAlert("Missing image required information.");
        setTimeout(() => setAlert(""), 5000);
      } else {
        const {
          success,
          data: uploadURL,
          error,
          message,
        } = await getR2PresignedURL(imageData);

        if (success) {
          const onProgress: (event: progressFallbackType) => void = (
            response,
          ) => {
            console.log("Upload progress: ", response);
            setUploadProgress(response.progress);
          };
          const { success, error, data, message } = await uploadImage(
            imageData,
            uploadURL,
            onProgress,
          );

          if (success) {
            const updateImageData = {
              ...imageData,
              ...data,
              isPrivate: false,
              oldIsPrivate: true,
              oldSlug: data.slug.substring(0, data.slug.lastIndexOf(".")),
              slug: data.slug.substring(0, data.slug.lastIndexOf(".")),
            };

            const {
              success,
              error,
              data: updatedImage,
              message,
            } = await updateImage(updateImageData);

            if (success) {
              setImageData(imageBoilerplate);
              setIsUploading(false);
              setOnCancel(true);
              setUploadProgress(0);
              setImg(
                `/api/image?p=${updatedImage.isPrivate}&src=${updatedImage.slug}`,
              );
              onClose();
            } else {
              setIsUploading(false);
              console.log("Error upload: ", error);
              setAlert(message);
              setTimeout(() => setAlert(""), 5000);
            }
          } else {
            setIsUploading(false);
            console.log("Error upload: ", error);
            setAlert(message);
            setTimeout(() => setAlert(""), 5000);
          }
        } else {
          console.log("Error generate URL: ", error);
          setIsUploading(false);
          setAlert(message);
          setTimeout(() => setAlert(""), 5000);
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.error("Error upload: ", error);
      setAlert("Error unknwon");
      setTimeout(() => setAlert(""), 5000);
    }
  };

  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      e.stopPropagation();
      console.dir(e.target.files);
      const file = e.target.files[0];

      if (file) {
        if (file.size <= 2000000) {
          /* const mybLob = new Blob([file], {
            type: file.type,
          }); */
          setImageData((prev: any) => ({
            ...prev,
            size: file.size,
            imageFile: file,
            type: file.type,
            format: getExtension(file.name),
            localPath: URL.createObjectURL(new Blob([file], { type: "file" })),
          }));
        } else {
          setAlert("Maximum image size is 2MB.");
          setTimeout(() => setAlert(""), 5000);
        }
      } else {
        setAlert("Image input invalid.");
        setTimeout(() => setAlert(""), 5000);
      }
    } else {
      e.stopPropagation();
      setAlert("Image input invalid.");
      setTimeout(() => setAlert(""), 5000);
    }
  };

  const handleCancelInput = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event from bubbling up
  };
  return (
    <div
      className={`grid w-full grid-cols-1 gap-5 ${onCancel ? "" : "md:grid-cols-2"}`}
    >
      <ImageInputField
        imageData={imageData}
        inputOnChange={handleInputOnChange}
        inputOnDrop={handleInputOnDrop}
        onCancelInput={handleCancelInput}
      />
      <UploadFormHandler
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        handleUpload={handleUpload}
        imageData={imageData}
        alert={alert}
        onCancel={onCancel}
        setOnCancel={setOnCancel}
        setImageData={setImageData}
      />
    </div>
  );
};

const getExtension = (fileName: string) => {
  if (!fileName.includes(".")) return ""; // no dot → no extension
  return "." + fileName.split(".").pop(); // returns ".jpg"
};
