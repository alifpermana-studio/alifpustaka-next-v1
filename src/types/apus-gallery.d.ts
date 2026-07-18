declare module "apus-gallery" {
  interface UploadImage {
    title: string;
    imageFile: File | null;
    localPath: string;
    slug: string;
    size: number;
    format: string;
    path: string;
    type: string;
    tags: string[];
    uploadTime: string;
    ownerUsername: string;
  }

  interface ImageFilter {
    sort: string;
    order: string;
    search: string;
    max: number;
    skip: number;
  }

  interface ImageGallery {
    title: string;
    id: string;
    slug: string;
    uploadTime: string;
    size: number;
    tags: string[];
    path: string;
    isPrivate: boolean;
    isFeatured: boolean;
    userId: string;
  }

  interface UpdateImage {
    title: string;
    slug: string;
    oldSlug: string;
    id: string;
    size: number;
    path: string;
    format: string;
    tags: string[];
    uploadTime: string;
    isPrivate: boolean;
    oldIsPrivate: boolean;
    isFeatured: boolean;
  }

  type Tag = {
    tag: string;
  };

  /* interface GalleryFilter {
    search: string;
    sort: string;
    order: string;
    max: number;
    skip: number;
  } */
}
