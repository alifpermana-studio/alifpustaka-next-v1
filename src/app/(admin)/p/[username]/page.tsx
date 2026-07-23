// app/blog/[slug]/page.tsx

import { Profile } from "@/components/pages/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alif Pustaka | Profile",
  description: "User Profile",
};

export default function ProfilePage() {
  return (
    <div>
      <Profile />
    </div>
  );
}
