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

export const VerifyEmail = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("e") || "");
  const backroute = searchParams.get("br");
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState({
    email: { error: false, message: "" },
  });

  const sendVerificationEmail = useCallback(async (e: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Check email: ", e);
      const { data, error } = await authClient.sendVerificationEmail({
        email: e,
        callbackURL: "/signin",
      });

      if (error) {
        throw error; // Throw the error to be caught in the catch block
      }

      // Sign up successful
      console.log("Send email result:", data);
      setIsSubmitted(true);

      // Redirect to the admin page
    } catch (error: unknown) {
      console.log("Error send email: ", error);
      setError(errorHandling(error));
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (email && backroute === "signup") {
      sendVerificationEmail(email);
    }
  }, []);

  useEffect(() => {
    const errorCheck = signupSchema.safeParse({
      email: email,
    });

    if (!errorCheck.success && email) {
      const errors = z.treeifyError(errorCheck.error);
      setFormError({
        email: {
          error: errors.properties?.email?.errors[0] ? true : false,
          message: errors.properties?.email?.errors[0] ?? "",
        },
      });
    }
    console.log("Email onChange: ", email);
  }, [email]);

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
      <div className="relative z-10 flex w-full flex-col justify-between gap-8 p-12">
        <div className="animate-in hidden items-center justify-center gap-3 lg:flex">
          <APusLightBanner className="w-72" />
        </div>

        <div
          className={`animate-in max-w-full ${backroute === "signup" ? "flex" : "hidden"} flex-col items-center justify-center gap-6`}
          style={{ animationDelay: "0.1s" }}
        >
          <MailCheck
            size={64}
            className={error || isLoading ? "hidden" : "mb-2 flex"}
          />
          <MailX size={64} className={error ?? "hidden"} />
          <LoaderCircle
            className={isLoading ? "animate-spin" : "hidden"}
            size={64}
          />
          <h1 className="font-800 text-3xl leading-[1.05] font-(--font-display) tracking-tight text-white">
            {isLoading
              ? "Sending verification email..."
              : "A verification email has been sent"}
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            One final step to join us, please verify your email using the link
            that was sent to you.
          </p>
          <p className="text-lg leading-relaxed text-slate-400">
            Didn't receive the email?{" "}
            <button
              className="cursor-pointer text-blue-500 hover:underline"
              onClick={() => sendVerificationEmail(email)}
            >
              Resend the email
            </button>
          </p>
        </div>

        <div
          className={`mx-auto w-full max-w-xl rounded-3xl ${backroute ? "hidden" : "flex"} animate-in flex-col border border-white/10 bg-white/3 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10`}
          style={{ animationDelay: "0.15s" }}
        >
          {/* mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <APusLightBanner className="w-72" />
          </div>

          {/* form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendVerificationEmail(email);
            }}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="font-500 mb-3 block text-xl text-slate-300"
              >
                Resend Email Verification
              </label>
              <div className="group relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1322] py-3 pr-4 pl-11 text-slate-100 placeholder-slate-500 transition-all outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/15"
                />
              </div>
              <div
                className={`${formError.email.error ? "flex" : "hidden"} mt-2 flex-row items-center gap-2 text-sm text-red-400`}
              >
                <TriangleAlert className="mr-1 h-4 w-4" />
                <p>{formError.email.message}</p>
              </div>
            </div>

            <button
              type="submit"
              className="group font-600 relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-blue-500 px-4 py-3.5 text-white shadow-lg shadow-blue-900/40 transition-all hover:shadow-blue-700/50 hover:brightness-110 active:scale-[0.99]"
            >
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {isSubmitted ? (
                <>
                  <Check className="h-5 w-5" />
                  Sended
                </>
              ) : isLoading ? (
                <>
                  Sending...
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
                </>
              ) : (
                <>
                  Send
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Has it been verified?{" "}
            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="font-600 cursor-pointer text-blue-400 transition-colors hover:text-blue-300"
            >
              Sign in
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
  console.log("SignUp error:", error);
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};
