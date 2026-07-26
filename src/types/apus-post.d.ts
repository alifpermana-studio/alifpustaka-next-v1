declare module "apus-post" {
  // Post status types
  // Valid values: "drafted", "submitted", "published", "deleted"
  export type PostStatus = "drafted" | "submitted" | "published" | "deleted";

  interface UploadPost {
    title: string;
    desc: string | null;
    slug: string;
    id: string;
    image: string;
    footnote: string;
    status: PostStatus;
    tags: string[];
    content: string;
  }

  interface PostFilter {
    sort: string;
    order: string;
    search: string;
    max: number;
    skip: number;
    status?: PostStatus | "";
  }

  interface Post {
    title: string;
    id: string;
    slug: string;
    uploadTime: Date;
    updatedAt?: Date;
    tags: string[];
    desc: string | null;
    footnote: string;
    status: PostStatus;
    userId: string;
    content: string;
    image: string;
  }

  export type PostTag = {
    tag: {
      name: string;
    };
  };

  interface PostListItem {
    id: string;
    title: string;
    slug: string;
    desc: string | null;
    image: string;
    status: PostStatus;
    tags: string[];
    uploadTime: Date;
    updatedAt?: Date;
    author: {
      id: string;
      name: string;
      username: string | null;
      image: string | null;
      role: string;
    };
  }

  interface PostReviewDetail extends Post {
    author: {
      id: string;
      name: string;
      username: string | null;
      image: string | null;
      role: string;
    };
  }

  interface PostFilterState {
    search: string;
    status: PostStatus | "";
  }
}
