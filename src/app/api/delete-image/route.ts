import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

export async function DELETE(req: NextRequest) {
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
    const { id, slug, isPrivate } = body;

    if (!id || !slug) {
      return NextResponse.json({
        success: false,
        message: "Image ID and slug are required.",
        data: null,
        error: "missing-fields",
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

    const bucket = isPrivate ? "apus-user-private" : "apus-user-public";

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: slug,
    });

    await s3Client.send(deleteCommand);

    await prisma.gallery.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully.",
      data: null,
      error: null,
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({
      success: false,
      message: "Error deleting image.",
      data: null,
      error: error,
    });
  }
}
