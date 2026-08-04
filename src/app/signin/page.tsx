"use client";

import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";

export default function SignInRedirect() {
  useEffect(() => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";
    const returnUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${adminUrl}/signin?returnUrl=${returnUrl}`;
  }, []);

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
