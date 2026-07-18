import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error("R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be defined.");
}

const s3Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT_S3_CLIENT,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: "auto",
});

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return NextResponse.json({
        success: false,
        message: "This action only available for authenticated user.",
        data: null,
        error: "no-user-token",
      });
    }

    const body = await req.json();
    const { id, title, slug, oldSlug, tags, isPrivate, oldIsPrivate, isFeatured } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Image ID is required.",
        data: null,
        error: "missing-id",
      });
    }

    const image = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!image || image.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        message: "Image not found or unauthorized.",
        data: null,
        error: "not-found-or-unauthorized",
      });
    }

    if (oldIsPrivate !== isPrivate) {
      const sourceBucket = oldIsPrivate ? "apus-user-private" : "apus-user-public";
      const destBucket = isPrivate ? "apus-user-private" : "apus-user-public";

      const copyCommand = new CopyObjectCommand({
        Bucket: destBucket,
        CopySource: `${sourceBucket}/${oldSlug}`,
        Key: slug,
      });

      await s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: sourceBucket,
        Key: oldSlug,
      });

      await s3Client.send(deleteCommand);
    } else if (oldSlug !== slug) {
      const bucket = isPrivate ? "apus-user-private" : "apus-user-public";

      const copyCommand = new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${oldSlug}`,
        Key: slug,
      });

      await s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: oldSlug,
      });

      await s3Client.send(deleteCommand);
    }

    const updatedImage = await prisma.gallery.update({
      where: { id },
      data: {
        title,
        slug,
        tags: tags || [],
        isPrivate,
        isFeatured,
        path: isPrivate ? `apus-user-private/${slug}` : `apus-user-public/${slug}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image updated successfully.",
      data: updatedImage,
      error: null,
    });
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json({
      success: false,
      message: "Error updating image.",
      data: null,
      error: error,
    });
  }
}
