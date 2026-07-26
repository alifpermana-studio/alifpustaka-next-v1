import { PostReview } from "@/components/admin/post-management/PostReview";

export async function generateMetadata() {
  return {
    title: "Admin | Review Post",
    description: "Review post submission",
  };
}

export default async function PostReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostReview slug={slug} />;
}
