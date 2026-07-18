import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../prisma/src/generated/prisma";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, action } = body;

    if (!data.title || !data.slug) {
      return NextResponse.json(
        { success: false, error: "missing-required-metadata" },
        { status: 400 }
      );
    }

    const userId = "dummyuser123";

    if (action === "drafted" || action === "submitted") {
      const existingPost = await prisma.post.findUnique({
        where: { id: data.id },
      });

      const status = action === "drafted" ? "drafted" : "submitted";

      let post;
      if (existingPost) {
        post = await prisma.post.update({
          where: { id: data.id },
          data: {
            title: data.title,
            desc: data.desc || null,
            slug: data.slug,
            image: data.image || "",
            footnote: data.footnote || "",
            status: status,
            content: data.md || "",
            updatedAt: new Date(),
          },
        });

        await prisma.postTag.deleteMany({
          where: { postId: data.id },
        });
      } else {
        post = await prisma.post.create({
          data: {
            id: data.id,
            title: data.title,
            desc: data.desc || null,
            slug: data.slug,
            image: data.image || "",
            footnote: data.footnote || "",
            status: status,
            content: data.md || "",
            userId: userId,
          },
        });
      }

      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          let tag = await prisma.tag.findUnique({
            where: { name: tagName },
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName },
            });
          }

          await prisma.postTag.create({
            data: {
              postId: post.id,
              tagId: tag.id,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Post ${status} successfully`,
        data: post,
      });
    }

    if (action === "deleted") {
      await prisma.post.update({
        where: { id: data.id },
        data: { status: "deleted" },
      });

      return NextResponse.json({
        success: true,
        message: "Post deleted successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing blog post:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
