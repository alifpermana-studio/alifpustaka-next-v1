"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth.client";
import { CircleUser, KeyRound, Mail, Shield, BadgeCheck } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { formatRole } from "@/lib/utils/format-role";

type userProps = {};

export function Profile({
  className,
  ...props
}: userProps & React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const { user } = useAuth();

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
    <div className="space-y-6">
      <Card className="bg-base-200">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {user?.image ? (
            <Image
              className="ring-accent/30 h-24 w-24 rounded-2xl object-cover ring-2"
              src={user?.image}
              alt="Alif Pustaka"
              width={96}
              height={96}
            />
          ) : (
            <CircleUser className="ring-accent/30 h-24 w-24 rounded-2xl object-cover p-2 ring-2" />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-accent text-2xl font-semibold">
                {user?.name}
              </h2>
              {user?.emailVerified && (
                <BadgeCheck className="fill-info h-5 w-5 text-white" />
              )}
              <Badge variant="accent">{formatRole(user?.role || "")}</Badge>
            </div>
            <p className="text-surface-400 mt-2 text-sm">
              Product-minded operator focused on growth systems, analytics, and
              platform reliability.
            </p>
            <div className="text-surface-300 mt-4 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-2">
                <Mail className="text-surface-500 h-4 w-4" />
                {user?.email}
              </span>
              <span className="inline-flex items-center gap-2">
                <Shield className="text-surface-500 h-4 w-4" />
                2FA enabled
              </span>
            </div>
          </div>
          <Button variant="secondary">Edit user</Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-base-200">
          <CardHeader
            title="Account details"
            description="Primary identity information"
          />
          <div className="space-y-4 text-sm">
            {[
              ["Full name", `${user?.name}`],
              ["Role", "User"],
              ["Department", "Operations"],
              ["Location", "Remote · EST"],
              ["Member since", "January 2025"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border-base-content/20 flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <span className="text-surface-400">{label}</span>
                <span className="text-secondary font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-base-200 text-base-content">
          <CardHeader
            title="Security"
            description="Credentials and access controls"
          />
          <div className="space-y-4">
            <div className="bg-base-300 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-base-content/15 text-base-content rounded-xl p-2">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-base-content text-sm font-semibold">
                    Password
                  </p>
                  <p className="text-base-content mt-1 text-xs">
                    Last changed 36 days ago
                  </p>
                </div>
                <Button
                  size="md"
                  variant="secondary"
                  className="text-base-content"
                >
                  Update
                </Button>
              </div>
            </div>
            <div className="bg-base-300 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-base-content/15 text-base-content rounded-xl p-2">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-base-content text-base font-semibold">
                    Two-factor authentication
                  </p>
                  <p className="text-base-content mt-1 text-xs">
                    Authenticator app connected
                  </p>
                </div>
                <Badge size="md" className="text-base-content">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
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
