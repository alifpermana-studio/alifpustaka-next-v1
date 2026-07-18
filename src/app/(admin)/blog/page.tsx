// app/[username]/page.tsx

import { BlogComponent } from "@/components/blog/BlogComponent";

// ⚡ This runs on the server before rendering
export async function generateMetadata() {
  return {
    title: "Blog Post Management",
    description: "Share your knowledge start from here.",
  };
}

export default function Page() {
  return (
    <div>
      <div className="border-base-300 bg-base-200 rounded-lg border p-5">
        <div className="space-y-6">
          <BlogComponent />
        </div>
      </div>
    </div>
  );
}
