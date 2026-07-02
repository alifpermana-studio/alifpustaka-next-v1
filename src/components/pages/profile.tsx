"use client";

import { useRouter } from "next/navigation";
import { APusLightBanner } from "@/icons/web-assets";
import { authClient } from "@/lib/auth.client";

type ProfileProps = {
  user: string;
};

export function Profile({
  className,
  user,
  ...props
}: ProfileProps & React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // 1. Terminate the current session & clear client-side state
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            console.log("Session terminated successfully.");
          },
        },
      });

      // 2. (Optional) Invalidate all sessions across all devices
      // await authClient.revokeSessions();

      // 3. Force redirect to prevent access to protected routes
      router.push("/signin");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-stretch overflow-hidden bg-[#060912]">
      {/* ambient blue glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-136 w-xl rounded-full bg-blue-600/25 blur-[120px]"
        style={{ animation: "drift 16s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-0 -bottom-52 h-144 w-xl rounded-full bg-indigo-500/20 blur-[130px]"
        style={{ animation: "drift 20s ease-in-out infinite reverse" }}
      />
      {/* grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(circle at 30% 40%, black, transparent 75%)",
          animation: "grid-pan 30s linear infinite",
        }}
      />

      <main className="relative z-10 flex w-full items-center justify-center px-12 py-6 lg:w-[50%]">
        <div
          className="animate-in w-full max-w-xl rounded-3xl border border-white/10 bg-white/3 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10"
          style={{ animationDelay: "0.15s" }}
        >
          {/* mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <APusLightBanner className="w-48" />
          </div>

          <h2 className="font-700 text-3xl font-(--font-display) tracking-tight text-white">
            Welcome back
          </h2>
          <button
            onClick={handleSignOut}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}

const errorHandling = (error: unknown): string => {
  console.log("SignUp error:", error);
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};
