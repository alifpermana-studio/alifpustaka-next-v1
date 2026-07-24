import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";
import * as permissions from "@/lib/permissions";
import { notifyPostApproved, notifyPostRejected } from "@/lib/notifications";

export async function PUT(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const body = await req.json();
    const { data, action } = body;

    if (!data.title || !data.slug) {
      return NextResponse.json(
        errorResponse("validation_error", "Title and slug are required"),
        { status: 400 }
      );
    }

    if (!data.id) {
      return NextResponse.json(
        errorResponse("validation_error", "Post ID is required"),
        { status: 400 }
      );
    }

    // Get existing post if it exists
    const existingPost = await prisma.post.findUnique({
      where: { id: data.id },
      include: {
        user: {
          select: { role: true },
        },
      },
    });

    // Handle drafted action
    if (action === "drafted") {
      // Users can draft their own posts or admins can draft any
      if (existingPost && existingPost.userId !== currentUser.userId) {
        if (!permissions.hasPermission(currentUser.role, "manage_all_posts")) {
          return NextResponse.json(
            errorResponse(
              "insufficient_permissions",
              "You can only edit your own posts"
            ),
            { status: 403 }
          );
        }
      }

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
            status: "drafted",
            content: data.md || "",
            updatedAt: new Date(),
          },
        });

        await prisma.postTag.deleteMany({
          where: { postId: data.id },
        });

        createAuditLogAsync({
          action: "post_drafted",
          entityType: "post",
          entityId: post.id,
          performedBy: currentUser.userId,
          performedByRole: currentUser.role,
          oldValue: { status: existingPost.status },
          newValue: { status: "drafted" },
          metadata: { postTitle: post.title, postSlug: post.slug },
          req,
        });

        // Notify post author if post was submitted and changed back to draft (rejected)
        if (existingPost.status === "submitted" && existingPost.userId !== currentUser.userId) {
          notifyPostRejected(existingPost.userId, existingPost.title, post.id);
        }
      } else {
        post = await prisma.post.create({
          data: {
            id: data.id,
            title: data.title,
            desc: data.desc || null,
            slug: data.slug,
            image: data.image || "",
            footnote: data.footnote || "",
            status: "drafted",
            content: data.md || "",
            user: {
              connect: {
                id: currentUser.userId,
              },
            },
          },
        });

        createAuditLogAsync({
          action: "post_created",
          entityType: "post",
          entityId: post.id,
          performedBy: currentUser.userId,
          performedByRole: currentUser.role,
          newValue: { status: "drafted", title: post.title },
          metadata: { postTitle: post.title, postSlug: post.slug },
          req,
        });
      }

      // Handle tags
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

      return NextResponse.json(
        successResponse("Post drafted successfully", post)
      );
    }

    // Handle submitted action
    if (action === "submitted") {
      // Check if user can submit posts
      if (!permissions.hasPermission(currentUser.role, "submit_posts")) {
        return NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            "You do not have permission to submit posts"
          ),
          { status: 403 }
        );
      }

      // Users can submit their own posts or admins can submit any
      if (existingPost && existingPost.userId !== currentUser.userId) {
        if (!permissions.hasPermission(currentUser.role, "manage_all_posts")) {
          return NextResponse.json(
            errorResponse(
              "insufficient_permissions",
              "You can only submit your own posts"
            ),
            { status: 403 }
          );
        }
      }

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
            status: "submitted",
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
            status: "submitted",
            content: data.md || "",
            user: {
              connect: {
                id: currentUser.userId,
              },
            },
          },
        });
      }

      // Handle tags
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

      createAuditLogAsync({
        action: "post_submitted",
        entityType: "post",
        entityId: post.id,
        performedBy: currentUser.userId,
        performedByRole: currentUser.role,
        oldValue: existingPost ? { status: existingPost.status } : null,
        newValue: { status: "submitted" },
        metadata: { postTitle: post.title, postSlug: post.slug },
        req,
      });

      return NextResponse.json(
        successResponse("Post submitted successfully", post)
      );
    }

    // Handle published action
    if (action === "published") {
      // Only Editor, Content Admin, and Super Admin can publish
      if (!permissions.canPublishPost(currentUser.role)) {
        return NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            "Only Editors and Admins can publish posts"
          ),
          { status: 403 }
        );
      }

      if (!existingPost) {
        return NextResponse.json(
          errorResponse("not_found", "Post not found"),
          { status: 404 }
        );
      }

      // Editor cannot publish Content Admin posts
      if (existingPost.user?.role) {
        if (
          !permissions.canReviewPost(currentUser.role, existingPost.user.role as any)
        ) {
          return NextResponse.json(
            errorResponse(
              "insufficient_permissions",
              "You cannot publish posts from Content Admin"
            ),
            { status: 403 }
          );
        }
      }

      const post = await prisma.post.update({
        where: { id: data.id },
        data: { status: "published" },
      });

      createAuditLogAsync({
        action: "post_published",
        entityType: "post",
        entityId: post.id,
        performedBy: currentUser.userId,
        performedByRole: currentUser.role,
        oldValue: { status: existingPost.status },
        newValue: { status: "published" },
        metadata: { postTitle: post.title, postSlug: post.slug },
        req,
      });

      // Notify post author if post was submitted and now published (approved)
      if (existingPost.status === "submitted" && existingPost.userId !== currentUser.userId) {
        notifyPostApproved(existingPost.userId, existingPost.title, post.id);
      }

      return NextResponse.json(
        successResponse("Post published successfully", post)
      );
    }

    // Handle deleted action
    if (action === "deleted") {
      if (!existingPost) {
        return NextResponse.json(
          errorResponse("not_found", "Post not found"),
          { status: 404 }
        );
      }

      // Check if user can delete this post
      if (
        !permissions.canDeletePost(
          currentUser.userId,
          existingPost.userId,
          currentUser.role
        )
      ) {
        return NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            "You do not have permission to delete this post"
          ),
          { status: 403 }
        );
      }

      await prisma.post.update({
        where: { id: data.id },
        data: { status: "deleted" },
      });

      createAuditLogAsync({
        action: "post_deleted",
        entityType: "post",
        entityId: data.id,
        performedBy: currentUser.userId,
        performedByRole: currentUser.role,
        oldValue: { status: existingPost.status },
        newValue: { status: "deleted" },
        metadata: { postTitle: existingPost.title, postSlug: existingPost.slug },
        req,
      });

      return NextResponse.json(
        successResponse("Post deleted successfully", null)
      );
    }

    return NextResponse.json(
      errorResponse("invalid_parameter", "Invalid action"),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing blog post:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to process blog post"),
      { status: 500 }
    );
  }
}
