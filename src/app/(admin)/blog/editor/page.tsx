import Editor from "@/components/blog/editor/Editor";
import { redirect } from "next/navigation";
import { Post, Tag } from "apus-post";
import { v4 } from "uuid";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function generateMetadata() {
  return {
    title: "Blog Post Editor",
    description: "Share your knowledge start from here.",
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // Check auth user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const token = { sub: "dummyuser123" };
  const key = (await searchParams).key || "";

  let findPost: any = null;

  if (key) {
    findPost = await prisma.post.findUnique({
      where: { id: key },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  if (findPost !== null) {
    if (session?.user.id === findPost?.userId) {
      const metadata = {
        id: findPost?.id || "",
        title: findPost?.title || "",
        slug: findPost?.slug || "",
        image: findPost?.image || "",
        desc: findPost?.desc || "",
        tags: findPost?.tags.map((postTag: Tag) => postTag.tag.name) || [],
      };
      return (
        <div>
          <div className="space-y-6">
            <Editor
              storageKey={key}
              postMd={findPost?.content || ""}
              postMetadata={metadata}
            />
          </div>
        </div>
      );
    } else {
      redirect(`/blog?error=no-permission`);
    }
  } else if (!key) {
    const newKey = v4();
    return (
      <div>
        <div className="space-y-6">
          <Editor storageKey={newKey} />
        </div>
      </div>
    );
  } else {
    redirect(`/blog?error=post-not-found`);
  }
}
