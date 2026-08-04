import { notFound } from "next/navigation";
import { BlogViewer } from "@/components/blog/view/BlogViewer";
import { publicApi, PublicPost } from "@/lib/api-client";

interface PostData {
  id: string;
  title: string;
  slug: string;
  desc: string | null;
  image: string;
  content: string;
  footnote: string;
  uploadTime: string;
  updatedAt: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

async function getPost(slug: string): Promise<PostData | null> {
  try {
    const post = await publicApi.getPostBySlug(slug);
    
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      desc: post.excerpt || null,
      image: post.coverImage || "",
      content: post.content,
      footnote: "",
      uploadTime: post.createdAt.toString(),
      updatedAt: post.updatedAt.toString(),
      tags: post.tags?.map(t => t.name) || [],
      author: {
        id: post.author.id,
        name: post.author.name,
        username: null,
        image: post.author.image || null,
      },
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.desc,
    openGraph: {
      title: post.title,
      description: post.desc || undefined,
      images: [post.image],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const postUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/blog/${post.slug}`;

  return <BlogViewer post={post} postUrl={postUrl} />;
}
