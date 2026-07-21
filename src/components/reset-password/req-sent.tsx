"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { signupSchema } from "@/schemas/user.schema";
import z from "zod";

import {
  ArrowRight,
  Check,
  Lock,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  UserRound,
  IdCard,
  TriangleAlert,
  MailCheck,
  LoaderCircle,
  MailX,
} from "lucide-react";
import { APusLightBanner } from "@/icons/web-assets";
import { authClient } from "@/lib/auth.client";

export const RequestSent = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full items-stretch overflow-hidden bg-[#060912]">
      {/* ambient blue glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-136 w-xl rounded-full bg-blue-600/25 blur-[120px]"
        style={{ animation: "drift 16s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-0 -bottom-52 h-144 w-xl rounded-full bg-indigo-500/20 text-3xl blur-[130px] hover:bg-black"
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
      <div className="relative z-10 mt-10 flex w-full flex-col justify-between gap-8 p-12">
        <div
          className={`animate-in max-w-full ${status === "sent" ? "flex" : "hidden"} flex-col items-center justify-center gap-6`}
          style={{ animationDelay: "0.1s" }}
        >
          <MailCheck size={64} className="mb-2 flex" />
          <h1 className="font-800 text-3xl leading-[1.05] font-(--font-display) tracking-tight text-white">
            A verification email has been sent
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            One final step to join us, please verify your email using the link
            that was sent to you.
          </p>
          <p className="text-lg leading-relaxed text-slate-400">
            Didn't receive the email?{" "}
            <button
              className="cursor-pointer text-blue-500 hover:underline"
              onClick={() => router.push("/req-reset-password")}
            >
              Resend the email
            </button>
          </p>
        </div>

        <div
          className="animate-in flex items-center justify-center gap-2 text-sm text-slate-500"
          style={{ animationDelay: "0.5s" }}
        >
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          SOC 2 Type II compliant · 99.99% uptime
        </div>
      </div>
    </div>
  );
};

const errorHandling = (error: unknown): string => {
  console.log("Reset password error:", error);
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};
