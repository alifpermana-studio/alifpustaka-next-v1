import { ChangePassword } from "@/components/reset-password/change-password";
import { connection } from "next/server";

export async function generateMetadata() {
  return {
    title: "Reset your password",
    description: "Enter your new password.",
  };
}

async function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <ChangePassword />
      </div>
    </div>
  );
}

export default Page;
