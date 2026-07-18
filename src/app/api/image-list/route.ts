import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "uploadTime";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const skip = parseInt(searchParams.get("skip") || "0");
    const max = parseInt(searchParams.get("max") || "20");

    const where: any = {
      userId: session.user.id,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [images, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: max,
      }),
      prisma.gallery.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Images retrieved successfully.",
      data: { images, total },
      error: null,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching images.",
      data: null,
      error: error,
    });
  }
}
