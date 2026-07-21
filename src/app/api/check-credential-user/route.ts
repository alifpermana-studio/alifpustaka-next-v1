import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: { providerId: "credential" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { hasCredentialAccount: false, message: "User not found" },
        { status: 200 },
      );
    }

    const hasCredentialAccount = user.accounts.length > 0;

    return NextResponse.json({
      hasCredentialAccount,
      message: hasCredentialAccount
        ? "User has credential account"
        : "User only has OAuth accounts. Password reset not available.",
    });
  } catch (error) {
    console.error("Error checking credential user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
