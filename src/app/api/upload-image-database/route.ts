import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
    const { title, slug, format, size, path, type, tags, ownerUsername } = body;

    if (!title || !slug || !format || !size || !path || !type) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields.",
        data: null,
        error: "missing-fields",
      });
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        slug: `${slug}${format}`,
        format,
        size,
        path,
        type,
        tags: tags || [],
        userId: session.user.id,
        isPrivate: path.includes("private"),
        isFeatured: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully.",
      data: gallery,
      error: null,
    });
  } catch (error) {
    console.error("Error uploading image to database:", error);
    return NextResponse.json({
      success: false,
      message: "Error uploading image to database.",
      data: null,
      error: error,
    });
  }
}
