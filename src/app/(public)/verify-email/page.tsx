import { VerifyEmail } from "@/components/pages/verify-email";
import { connection } from "next/server";

export async function generateMetadata() {
  return {
    title: "Verify your email",
    description: "Verify your email address to access certain features.",
  };
}

async function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <VerifyEmail />
      </div>
    </div>
  );
}

export default Page;
