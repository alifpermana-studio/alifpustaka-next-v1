import { VerifyEmail } from "@/components/pages/verify-email";
import { connection } from "next/server";

async function Page() {
  await connection();
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <VerifyEmail />
      </div>
    </div>
  );
}

export default Page;
