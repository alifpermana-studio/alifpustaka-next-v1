import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";
import * as permissions from "@/lib/permissions";
import { notifyPostApproved, notifyPostRejected } from "@/lib/notifications";
import { AuditAction } from "@/types/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  if (!permissions.hasPermission(currentUser.role, "review_posts")) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You do not have permission to review posts",
      ),
      { status: 403 },
    );
  }

  try {
    const post = await prisma.post.findUnique({
      where: { slug: slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            role: true,
          },
        },
        post_tag: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(errorResponse("not_found", "Post not found"), {
        status: 404,
      });
    }

    // Check if post is drafted or deleted and user is not the author
    if (
      (post.status === "drafted" || post.status === "deleted") &&
      post.userId !== currentUser.userId
    ) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You cannot access this post",
        ),
        { status: 403 },
      );
    }

    // Check if current user can review this post author's posts
    if (
      !permissions.canReviewPost(currentUser.role as any, post.user.role as any)
    ) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You cannot review posts from this author",
        ),
        { status: 403 },
      );
    }

    const formattedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      desc: post.desc,
      image: post.image,
      footnote: post.footnote,
      status: post.status,
      content: post.content,
      tags: post.post_tag.map((pt) => pt.tag.name),
      uploadTime: post.uploadTime,
      updatedAt: post.updatedAt,
      author: {
        id: post.user.id,
        name: post.user.name,
        username: post.user.username,
        image: post.user.image,
        role: post.user.role,
      },
    };

    return NextResponse.json(
      successResponse("Post fetched successfully", formattedPost),
    );
  } catch (error) {
    console.error("Error fetching post for review:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch post"),
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  if (!permissions.hasPermission(currentUser.role, "review_posts")) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You do not have permission to review posts",
      ),
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const { action, footnote } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        errorResponse("invalid_parameter", "Invalid action"),
        { status: 400 },
      );
    }

    if (typeof footnote !== "string") {
      return NextResponse.json(
        errorResponse("validation_error", "Footnote is required"),
        { status: 400 },
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { slug: slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!existingPost) {
      return NextResponse.json(errorResponse("not_found", "Post not found"), {
        status: 404,
      });
    }

    // Check if post is drafted or deleted and user is not the author
    if (
      (existingPost.status === "drafted" ||
        existingPost.status === "deleted") &&
      existingPost.userId !== currentUser.userId
    ) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You cannot review this post",
        ),
        { status: 403 },
      );
    }

    // Check if current user can review this post author's posts
    if (
      !permissions.canReviewPost(
        currentUser.role as any,
        existingPost.user.role as any,
      )
    ) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You cannot review posts from this author",
        ),
        { status: 403 },
      );
    }

    let newStatus: string;
    let auditAction: AuditAction;
    let notificationFn:
      ((userId: string, title: string, postId: string) => void) | null = null;

    if (action === "approve") {
      newStatus = "published";
      auditAction = "post_approved";
      if (existingPost.userId !== currentUser.userId) {
        notificationFn = notifyPostApproved;
      }
    } else {
      // action === "reject"
      newStatus = "drafted";
      auditAction = "post_rejected";
      if (existingPost.userId !== currentUser.userId) {
        notificationFn = notifyPostRejected;
      }
    }

    const updatedPost = await prisma.post.update({
      where: { slug: slug },
      data: {
        status: newStatus,
        footnote: footnote,
        updatedAt: new Date(),
      },
    });

    // Send notification to author if it's not the same user
    if (notificationFn) {
      notificationFn(existingPost.userId, existingPost.title, existingPost.id);
    }

    // Create audit log
    createAuditLogAsync({
      action: auditAction,
      entityType: "post",
      entityId: existingPost.id,
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      oldValue: { status: existingPost.status },
      newValue: { status: newStatus },
      metadata: {
        postTitle: existingPost.title,
        postSlug: existingPost.slug,
        footnote: footnote,
      },
      req,
    });

    return NextResponse.json(
      successResponse(
        action === "approve"
          ? "Post approved and published"
          : "Post rejected and sent to draft",
        updatedPost,
      ),
    );
  } catch (error) {
    console.error("Error reviewing post:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to review post"),
      { status: 500 },
    );
  }
}
