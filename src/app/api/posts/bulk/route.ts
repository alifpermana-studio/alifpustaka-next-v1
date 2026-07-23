import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";
import { PostStatus } from "apus-post";

export async function PATCH(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const body = await req.json();
    const { action, postIds, data } = body;

    if (!action || !postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        errorResponse("validation_error", "Action and postIds array are required"),
        { status: 400 }
      );
    }

    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds },
      },
      select: {
        id: true,
        userId: true,
        title: true,
        slug: true,
        status: true,
      },
    });

    const unauthorizedPosts = posts.filter((post) => post.userId !== currentUser.userId);
    
    if (unauthorizedPosts.length > 0) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You can only modify your own posts"
        ),
        { status: 403 }
      );
    }

    const validPostIds = posts.map((p) => p.id);

    if (action === "change_status") {
      if (!data || !data.status) {
        return NextResponse.json(
          errorResponse("validation_error", "Status is required"),
          { status: 400 }
        );
      }

      const validStatuses: PostStatus[] = ["published", "submitted", "drafted", "deleted"];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          errorResponse("validation_error", "Invalid status"),
          { status: 400 }
        );
      }

      const results = await Promise.allSettled(
        validPostIds.map(async (postId) => {
          const post = posts.find((p) => p.id === postId);
          await prisma.post.update({
            where: { id: postId },
            data: { status: data.status, updatedAt: new Date() },
          });

          const auditAction = 
            data.status === "published" ? "post_published" :
            data.status === "drafted" ? "post_drafted" :
            data.status === "submitted" ? "post_submitted" :
            "post_deleted";

          createAuditLogAsync({
            action: auditAction,
            entityType: "post",
            entityId: postId,
            performedBy: currentUser.userId,
            performedByRole: currentUser.role,
            oldValue: { status: post?.status },
            newValue: { status: data.status },
            metadata: { bulkAction: true },
            req,
          });

          return postId;
        })
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json(
        successResponse(
          `${succeeded} post(s) updated${failed > 0 ? `, ${failed} failed` : ""}`,
          { succeeded, failed }
        )
      );
    }

    if (action === "delete") {
      const results = await Promise.allSettled(
        validPostIds.map(async (postId) => {
          const post = posts.find((p) => p.id === postId);
          await prisma.post.update({
            where: { id: postId },
            data: { status: "deleted", updatedAt: new Date() },
          });

          createAuditLogAsync({
            action: "post_deleted",
            entityType: "post",
            entityId: postId,
            performedBy: currentUser.userId,
            performedByRole: currentUser.role,
            oldValue: { status: post?.status },
            newValue: { status: "deleted" },
            metadata: { bulkAction: true, postTitle: post?.title, postSlug: post?.slug },
            req,
          });

          return postId;
        })
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json(
        successResponse(
          `${succeeded} post(s) deleted${failed > 0 ? `, ${failed} failed` : ""}`,
          { succeeded, failed }
        )
      );
    }

    if (action === "add_tags") {
      if (!data || !data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
        return NextResponse.json(
          errorResponse("validation_error", "Tags array is required"),
          { status: 400 }
        );
      }

      const results = await Promise.allSettled(
        validPostIds.map(async (postId) => {
          for (const tagName of data.tags) {
            let tag = await prisma.tag.findUnique({
              where: { name: tagName.trim() },
            });

            if (!tag) {
              tag = await prisma.tag.create({
                data: { name: tagName.trim() },
              });
            }

            const existingPostTag = await prisma.postTag.findUnique({
              where: {
                postId_tagId: {
                  postId,
                  tagId: tag.id,
                },
              },
            });

            if (!existingPostTag) {
              await prisma.postTag.create({
                data: {
                  postId,
                  tagId: tag.id,
                },
              });
            }
          }

          await prisma.post.update({
            where: { id: postId },
            data: { updatedAt: new Date() },
          });

          return postId;
        })
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json(
        successResponse(
          `Tags added to ${succeeded} post(s)${failed > 0 ? `, ${failed} failed` : ""}`,
          { succeeded, failed }
        )
      );
    }

    if (action === "remove_tags") {
      if (!data || !data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
        return NextResponse.json(
          errorResponse("validation_error", "Tags array is required"),
          { status: 400 }
        );
      }

      const results = await Promise.allSettled(
        validPostIds.map(async (postId) => {
          const tags = await prisma.tag.findMany({
            where: { name: { in: data.tags.map((t: string) => t.trim()) } },
            select: { id: true },
          });

          if (tags.length > 0) {
            await prisma.postTag.deleteMany({
              where: {
                postId,
                tagId: { in: tags.map((t) => t.id) },
              },
            });

            await prisma.post.update({
              where: { id: postId },
              data: { updatedAt: new Date() },
            });
          }

          return postId;
        })
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json(
        successResponse(
          `Tags removed from ${succeeded} post(s)${failed > 0 ? `, ${failed} failed` : ""}`,
          { succeeded, failed }
        )
      );
    }

    return NextResponse.json(
      errorResponse("invalid_parameter", "Invalid action"),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing bulk action:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to process bulk action"),
      { status: 500 }
    );
  }
}
