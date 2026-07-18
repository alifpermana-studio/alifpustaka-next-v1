declare module "apus-post" {
  interface UploadPost {
    title: string;
    desc: string | null;
    slug: string;
    id: string;
    image: string;
    footnote: string;
    status: string;
    tags: string[];
    content: string;
  }

  interface PostFilter {
    sort: string;
    order: string;
    search: string;
    max: number;
    skip: number;
  }

  interface Post {
    title: string;
    id: string;
    slug: string;
    uploadTime: Date;
    tags: Tag[];
    desc: string | null;
    footnote: string;
    status: string;
    userId: string;
    content: string;
    image: string;
  }

  type Tag = {
    tag: {
      name: string;
    };
  };
}
