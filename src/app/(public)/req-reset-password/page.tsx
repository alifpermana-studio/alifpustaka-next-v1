import { RequestResetPassword } from "@/components/reset-password/req-reset-password";
import { VerifyEmail } from "@/components/pages/verify-email";
import { RequestSent } from "@/components/reset-password/req-sent";
import { connection } from "next/server";

export async function generateMetadata() {
  return {
    title: "Reset your password",
    description: "Reset your password here.",
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const status = resolvedParams.status || ""; // Handles ?query=electronics

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        {status === "sent" ? <RequestSent /> : <RequestResetPassword />}
      </div>
    </div>
  );
}
