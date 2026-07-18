import { VerifyEmail } from "@/components/pages/verify-email";
import { ResetPassword } from "@/components/reset-password/reset-password";
import { connection } from "next/server";

export async function generateMetadata() {
  return {
    title: "Reset your password",
    description: "Reset your password here.",
  };
}

async function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <ResetPassword />
      </div>
    </div>
  );
}

export default Page;
