import { ImageGallery, UpdateImage, UploadImage } from "apus-gallery";
import axios from "axios";

export const getR2PresignedURL = async (imageData: UploadImage) => {
  try {
    const res = await fetch(
      `/api/get-presigned-url?slug=${imageData.slug}${imageData.format}&type=${imageData.type}&action=generate-presigned-url`,
      {
        method: "GET",
      },
    );

    const { success, data, error, message } = await res.json();

    if (success) {
      return {
        success: true,
        message: message,
        data: data,
        error: null,
      };
    } else {
      return {
        success: false,
        message: message,
        data: null,
        error: error,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Error unknown",
      data: null,
      error: error,
    };
  }
};

interface progressFallbackType {
  message: string;
  progress: number;
  error: string | null;
}

export const uploadImage = async (
  imageData: UploadImage,
  presignedURL: string = "",
  onProgress: (event: progressFallbackType) => void,
) => {
  try {
    const res = await axios.put(presignedURL, imageData.imageFile, {
      onUploadProgress: (progress) => {
        if (progress?.total && progress?.loaded) {
          const percentCompleted = Math.round(
            (progress.loaded * 100) / progress.total,
          );
          onProgress({
            message: "uploading",
            progress: percentCompleted,
            error: null,
          });
        }
      },
      headers: {
        "Content-Type": imageData.type, // e.g. "image/jpeg" or "image/png"
      },
    });

    const uploadRes = await res;

    console.log("Upload image: ", uploadRes.data);

    return uploadImageDatabase(imageData, onProgress);
  } catch (error) {
    console.error("Upload image: ", error);
    return {
      success: false,
      message: "Error unknown",
      data: null,
      error: error,
    };
  }
};

const uploadImageDatabase = async (
  imageData: UploadImage,
  onProgress: (event: progressFallbackType) => void,
) => {
  try {
    const updateDb = await fetch("/api/upload-image-database", {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(imageData),
    });

    const { success, message, data, error } = await updateDb.json();

    if (success) {
      onProgress({
        message: message,
        progress: 100,
        error: null,
      });
      return {
        success: true,
        message: "Upload image success.",
        data: data,
        error: null,
      };
    } else {
      console.error("Error upload image: ", error);
      onProgress({
        message: "Failed",
        progress: 0,
        error: error,
      });
      return {
        success: false,
        message: "Error upload unknown.",
        data: null,
        error: error,
      };
    }
  } catch (error) {
    console.error("Error upload image: ", error);
    return {
      success: false,
      message: "Error upload unknown.",
      data: null,
      error: error,
    };
  }
};

interface ImageFilterType {
  order: string;
  sort: string;
  max: number;
  skip: number;
  search: string;
}

export const getImageList = async (filter: ImageFilterType) => {
  try {
    const res = await fetch(
      `/api/image-list?sort=${filter.sort}&order=${filter.order}${filter.search ? `&search=${filter.search}` : ""}&skip=${filter.skip}&max=${filter.max}`,
      {
        method: "GET",
      },
    );

    const { success, message, data, error } = await res.json();
    return {
      success: success,
      message: message,
      data: data,
      error: error,
    };
  } catch (error) {
    console.log("Error getImageList: ", error);
    return {
      success: false,
      message: "Error unknown",
      data: null,
      error: error,
    };
  }
};

export const updateImage = async (imageData: UpdateImage) => {
  try {
    const res = await fetch("/api/update-image", {
      method: "PUT",
      body: JSON.stringify(imageData),
    });

    const { message, success, data, error } = await res.json();

    return {
      message: message,
      success: success,
      data: data,
      error: error,
    };
  } catch (error) {
    console.log("Error R2ImageHandler updateImage: ", error);
    return {
      success: false,
      message: "Error unknown.",
      data: null,
      error: error,
    };
  }
};

export const deleteImage = async (imageData: ImageGallery) => {
  try {
    const res = await fetch("/api/delete-image", {
      method: "DELETE",
      body: JSON.stringify(imageData),
    });

    const { message, success, data, error } = await res.json();

    return {
      message: message,
      success: success,
      data: data,
      error: error,
    };
  } catch (error) {
    console.log("Error R2ImageHandler deleteImage: ", error);
    return {
      success: false,
      message: "Error unknown.",
      data: null,
      error: error,
    };
  }
};
