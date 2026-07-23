// app/api/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { headers } from "next/headers";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";

// Get the access key and secret key from environment variables
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

// Ensure both keys are defined, or throw an error
if (!accessKeyId || !secretAccessKey) {
  throw new Error("R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be defined.");
}

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_S3_CLIENT,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const imageBaseURL = process.env.R2_PUBLIC_BASE_URL || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");
  const p = searchParams.get("p");

  if (!src || !p) {
    return NextResponse.json({
      success: false,
      message: "Missing required parameter.",
      data: null,
      error: "missing-required-parameter",
    });
  }

  const isPrivate = p.toLowerCase() === "true";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("Check private image:", session);

  if (isPrivate) {
    if (!session?.user.id) {
      return NextResponse.json({
        success: false,
        message: "This action only available for authenticated user.",
        data: null,
        error: "no-user-token",
      });
    } else if (
      typeof session.session.expiresAt === "number" &&
      session.session.expiresAt <= Date.now()
    ) {
      return NextResponse.json({
        success: false,
        message: "This action only available for authenticated user.",
        data: null,
        error: "session-expired",
      });
    } else {
      return fetchPrivateImage(src, s3);
    }
  } else {
    return fetchPublicImage(src, imageBaseURL);
  }
}

const fetchPublicImage = async (src: string, url: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: "apus-user-public",
      Key: src,
    });

    const data = await s3.send(command);

    if (!data.Body)
      return NextResponse.json({
        success: false,
        message: "No body returned from R2.",
        data: null,
        error: "s3-send-failed",
      });

    return new Response(data.Body as ReadableStream, {
      headers: {
        "Content-Type": data.ContentType ?? "application/octet-stream",
      },
    });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch image.",
      data: null,
      error: "no-user-token",
    });
  }
};

const fetchPrivateImage = async (src: string, s3: S3Client) => {
  try {
    const command = new GetObjectCommand({
      Bucket: "apus-user-private",
      Key: src,
    });

    const data = await s3.send(command);

    if (!data.Body)
      return NextResponse.json({
        success: false,
        message: "No body returned from R2.",
        data: null,
        error: "s3-send-failed",
      });

    return new Response(data.Body as ReadableStream, {
      headers: {
        "Content-Type": data.ContentType ?? "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error fetch private image: ", error);
    return NextResponse.json({
      success: false,
      message: "Error unknown.",
      data: null,
      error: error,
    });
  }
};
