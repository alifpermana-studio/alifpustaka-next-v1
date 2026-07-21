"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { passwordResetSchema } from "@/schemas/password-reset.schema";
import z from "zod";

import {
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  TriangleAlert,
  CheckCircle,
} from "lucide-react";
import { APusLightBanner } from "@/icons/web-assets";
import { authClient } from "@/lib/auth.client";

export const ChangePassword = () => {
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState({
    password: { error: false, message: "" },
    confirmPassword: { error: false, message: "" },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  useEffect(() => {
    const errorCheck = passwordResetSchema.safeParse({
      password: passwordForm.password,
      confirmPassword: passwordForm.confirmPassword,
    });

    if (!errorCheck.success) {
      const errors = z.treeifyError(errorCheck.error);
      const updateFormError = {} as typeof formError;

      (Object.keys(passwordForm) as Array<keyof typeof passwordForm>).forEach(
        (field) => {
          if (passwordForm[field] === "") {
            updateFormError[field] = {
              error: false,
              message: "",
            };
          } else {
            updateFormError[field] = {
              error: errors?.properties?.[field]?.errors[0] ? true : false,
              message: errors?.properties?.[field]?.errors[0] ?? "",
            };
          }
        },
      );
      setFormError(updateFormError);
    } else {
      setFormError({
        password: { error: false, message: "" },
        confirmPassword: { error: false, message: "" },
      });
    }
  }, [passwordForm]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: passwordForm.password,
        token,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/signin?reset=success");
      }, 3000);
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to reset password. Token may be expired or invalid.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#060912]">
        <div className="text-center">
          <TriangleAlert size={64} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-3xl font-bold text-white">Invalid Reset Link</h1>
          <p className="mt-2 text-slate-400">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => router.push("/req-reset-password")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#060912]">
        <div className="text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
          <h1 className="text-3xl font-bold text-white">
            Password Reset Successful!
          </h1>
          <p className="mt-2 text-slate-400">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-stretch overflow-hidden bg-[#060912]">
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-136 w-xl rounded-full bg-blue-600/25 blur-[120px]"
        style={{ animation: "drift 16s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-0 -bottom-52 h-144 w-xl rounded-full bg-indigo-500/20 text-3xl blur-[130px]"
        style={{ animation: "drift 20s ease-in-out infinite reverse" }}
      />
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
          className="animate-in mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/3 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <APusLightBanner className="w-72" />
          </div>

          <h1 className="mb-6 text-2xl font-bold text-white">
            Reset Your Password
          </h1>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <TriangleAlert className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="font-500 mb-1.5 block text-sm text-slate-300"
              >
                New Password
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordForm.password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1322] py-3 pr-11 pl-11 text-slate-100 placeholder-slate-500 transition-all outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              <div
                className={`${formError.password.error ? "flex" : "hidden"} mt-2 flex-row items-center gap-2 text-sm text-red-400`}
              >
                <TriangleAlert className="mr-1 inline h-4 w-4" />
                <p>{formError.password.message}</p>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="font-500 mb-1.5 block text-sm text-slate-300"
              >
                Confirm Password
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1322] py-3 pr-11 pl-11 text-slate-100 placeholder-slate-500 transition-all outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              <div
                className={`${formError.confirmPassword.error ? "flex" : "hidden"} mt-2 flex-row items-center gap-2 text-sm text-red-400`}
              >
                <TriangleAlert className="mr-1 inline h-4 w-4" />
                <p>{formError.confirmPassword.message}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group font-600 relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-blue-500 px-4 py-3.5 text-white shadow-lg shadow-blue-900/40 transition-all hover:shadow-blue-700/50 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {isLoading ? (
                <>Resetting...</>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Remember your password?{" "}
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
