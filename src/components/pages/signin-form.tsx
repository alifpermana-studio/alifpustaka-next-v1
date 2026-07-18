"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { GoogleIcon, GithubIcon } from "@/icons/brands";
import { APusColorSquare, APusLightBanner } from "@/icons/web-assets";
import { authClient } from "@/lib/auth.client";

export function SignInForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  // Handle form submission
  const handleSignIn = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setSubmitted(true);

    try {
      // Attempt to sign in with provided email and password
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/p",
        rememberMe: remember,
      });

      if (error) {
        // Display and log any sign-in errors
        throw error;
      }

      // Sign in successful
      console.log(data);

      // Redirect to the admin page
      // Typically you would want to redirect them to a protected page an add a check to see if they are admin or
      // create a new page for admin
      router.push("/p");
    } catch (error: unknown) {
      console.log("Signin error: ", error);
    } finally {
      setSubmitted(false);
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

      {/* LEFT brand panel */}
      <aside className="relative z-10 hidden w-[50%] flex-col justify-between p-12 lg:flex">
        <div className="animate-in flex items-center gap-4">
          <APusColorSquare className="w-12" />
          <APusLightBanner className="w-52" />
        </div>

        <div className="animate-in max-w-md" style={{ animationDelay: "0.1s" }}>
          <h1 className="font-800 text-5xl leading-[1.05] font-(--font-display) tracking-tight text-white">
            Build at the
            <span className="bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              {" "}
              speed of thought.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Sign in to your workspace and pick up right where you left off.
            Secure, fast, and made for teams that ship.
          </p>

          <div className="mt-10 space-y-3.5">
            {[
              "End-to-end encrypted sessions",
              "Single sign-on with Google & GitHub",
              "Trusted by 40,000+ developers",
            ].map((t, i) => (
              <div
                key={t}
                className="animate-in flex items-center gap-3"
                style={{ animationDelay: `${0.25 + i * 0.08}s` }}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-500/15 ring-1 ring-blue-400/30">
                  <Check className="h-3.5 w-3.5 text-blue-300" />
                </span>
                <span className="text-slate-300">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="animate-in flex items-center gap-2 text-sm text-slate-500"
          style={{ animationDelay: "0.5s" }}
        >
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          SOC 2 Type II compliant · 99.99% uptime
        </div>
      </aside>

      {/* RIGHT form panel */}
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
          <p className="mt-2 text-slate-400">
            Sign in to continue to your dashboard.
          </p>

          {/* OAuth buttons */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="group font-500 flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-200 transition-all hover:border-blue-400/40 hover:bg-white/[0.07] active:scale-[0.98]"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              type="button"
              className="group font-500 flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-200 transition-all hover:border-blue-400/40 hover:bg-white/[0.07] active:scale-[0.98]"
            >
              <GithubIcon className="brightness-0 invert" />
              GitHub
            </button>
          </div>

          {/* divider */}
          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-widest text-slate-500 uppercase">
              or with email
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {/* form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="font-500 mb-1.5 block text-sm text-slate-300"
              >
                Email address
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
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="font-500 block text-sm text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="font-500 text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="group relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1322] py-3 pr-11 pl-11 text-slate-100 placeholder-slate-500 transition-all outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:text-slate-300"
                >
                  {showPw ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 select-none">
              <button
                type="button"
                onClick={() => setRemember((r) => !r)}
                className={`grid h-5 w-5 place-items-center rounded-md border transition-all ${
                  remember
                    ? "border-blue-500 bg-blue-500"
                    : "border-white/20 bg-transparent"
                }`}
              >
                {remember && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
              <span className="text-sm text-slate-400">Keep me signed in</span>
            </label>

            <button
              type="submit"
              className="group font-600 relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-blue-500 px-4 py-3.5 text-white shadow-lg shadow-blue-900/40 transition-all hover:shadow-blue-700/50 hover:brightness-110 active:scale-[0.99]"
            >
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {submitted ? (
                <>
                  <Check className="h-5 w-5" />
                  Signed in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="font-600 cursor-pointer text-blue-400 transition-colors hover:text-blue-300"
            >
              Create one
            </button>
          </p>
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
