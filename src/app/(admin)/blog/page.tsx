// app/[username]/page.tsx

import { BlogComponent } from "@/components/blog/BlogComponent";
import { BlogOptions } from "@/components/blog/BlogOptions";

// ⚡ This runs on the server before rendering
export async function generateMetadata() {
  return {
    title: "Blog Post Management",
    description: "Share your knowledge start from here.",
  };
}

export default function Page() {
  return (
    <div className="space-y-6">
      <BlogOptions />
      <BlogComponent />
    </div>
  );
}
