import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        desc: true,
        image: true,
        content: true,
        footnote: true,
        uploadTime: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const formattedPost = {
      ...post,
      tags: post.tags.map((t) => t.tag.name),
      author: post.user,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
