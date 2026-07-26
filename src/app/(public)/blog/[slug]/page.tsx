import { notFound } from "next/navigation";
import { BlogViewer } from "@/components/blog/view/BlogViewer";

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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blog/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
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

  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/blog/${post.slug}`;

  return <BlogViewer post={post} postUrl={postUrl} />;
}
