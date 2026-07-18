import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { RequestChecksumCalculation } from "@aws-sdk/middleware-flexible-checksums";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Get the access key and secret key from environment variables
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

// Ensure both keys are defined, or throw an error
if (!accessKeyId || !secretAccessKey) {
  throw new Error("R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be defined.");
}

const s3Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT_S3_CLIENT, // R2 endpoint
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: "auto", // Region (Cloudflare R2 uses auto)
  requestChecksumCalculation: RequestChecksumCalculation.WHEN_REQUIRED,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const slug = searchParams.get("slug") || "";
  const type = searchParams.get("type") || "";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.username) {
    return NextResponse.json({
      success: false,
      message: "This action only available for authenticated user.",
      data: null,
      error: "no-user-token",
    });
  }

  if (
    typeof session.session.expiresAt === "number" &&
    session.session.expiresAt <= Date.now()
  ) {
    return NextResponse.json({
      success: false,
      message: "This action only available for authenticated user.",
      data: null,
      error: "session-expired",
    });
  }

  if (!slug || !type) {
    return NextResponse.json({
      success: false,
      message: "Invalid request.",
      data: null,
      error: "parameter-incorrect",
    });
  }

  return checkSlug({ slug, type });
}

interface R2PresignedURLType {
  slug: string;
  type: string;
}

const checkSlug = async ({ slug, type }: R2PresignedURLType) => {
  try {
    const res = await prisma.gallery.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!res) {
      return serverPresignedURL({ slug, type });
    } else {
      return NextResponse.json({
        success: false,
        message: "Slug already exist, please provides unique one.",
        data: null,
        error: "image-slug-exist",
      });
    }
  } catch (error) {
    console.error("Failed check unique slug: ", error);
    return NextResponse.json({
      success: false,
      message: "Error unknown.",
      data: null,
      error: "failed-check-unique-slug",
    });
  }
};

const serverPresignedURL = async ({ slug, type }: R2PresignedURLType) => {
  try {
    const params = {
      Bucket: "apus-user-private", // Your R2 bucket name
      Key: slug, // Object key (filename)
      ContentType: type, // Content Type (MIME type of the file)
    };

    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    console.log("Upload data: ", {
      name: slug,
      type: type,
      response: uploadUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Pre-signed URL generated.",
      data: uploadUrl,
      error: null,
    });
  } catch (error) {
    console.error("Error generate upload URL: ", error);
    return NextResponse.json({
      success: false,
      message: "Error generating pre-signed URL.",
      data: null,
      error: error,
    });
  }
};
