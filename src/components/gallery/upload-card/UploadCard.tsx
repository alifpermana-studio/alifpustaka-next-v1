"use client";

import React, { useEffect, useState } from "react";

import { UploadImage } from "apus-gallery";
import { ImageInputField } from "./ImageInputField";
import { getR2PresignedURL, uploadImage } from "@/lib/R2ImageHandler";
import { UploadFormHandler } from "./UploadFormHandler";
import { useGallery } from "@/hooks/useGallery";

interface progressFallbackType {
  message: string;
  progress: number;
  error: string | null;
}

export const UploadCard = () => {
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
  const { refresh } = useGallery();

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
          const { success, error, message } = await uploadImage(
            imageData,
            uploadURL,
            onProgress,
          );

          if (success) {
            setImageData(imageBoilerplate);
            setIsUploading(false);
            setOnCancel(true);
            setUploadProgress(0);
            refresh();
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
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="grid w-full grid-cols-1 gap-5">
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
    </div>
  );
};

const getExtension = (fileName: string) => {
  if (!fileName.includes(".")) return ""; // no dot → no extension
  return "." + fileName.split(".").pop(); // returns ".jpg"
};
