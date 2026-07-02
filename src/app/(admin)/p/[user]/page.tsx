// app/blog/[slug]/page.tsx

import { Profile } from "@/components/pages/profile";

interface PageProps {
  params: Promise<{ user: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  // Await the params object to access the dynamic segment safely
  const resolvedParams = await params;
  const user = resolvedParams.user;

  return (
    <div>
      <Profile user={user} />
    </div>
  );
}
