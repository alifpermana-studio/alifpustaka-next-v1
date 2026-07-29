"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Discussion } from "@/types/discussion";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { MessageSquare } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  postSlug: string;
  postTitle: string;
}

export function CommentSection({ postId, postSlug, postTitle }: CommentSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch once on mount or when postId/page changes
    if (hasFetched.current && page === 1) return;

    const fetchComments = async () => {
      try {
        const params = new URLSearchParams({
          skip: String((page - 1) * limit),
          limit: String(limit),
        });

        const response = await fetch(`/api/blog/${postSlug}/comments?${params}`);
        const result = await response.json();

        if (result.success) {
          setComments(result.data);
          setHasMore(result.meta.pagination?.hasMore || false);
          hasFetched.current = true;
        } else {
          showToast(
            result.error?.message || "Failed to load comments",
            "error",
          );
        }
      } catch (error) {
        showToast("Failed to load comments", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postSlug, page]);

  const handleSubmitComment = async (content: string) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          sourceType: "blog_post",
          sourceId: postId,
          parentId: null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("Comment submitted for review", "success");
        // Manually refresh comments
        hasFetched.current = false;
        setPage(1);
        setLoading(true);
      } else {
        showToast(result.error?.message || "Failed to post comment", "error");
      }
    } catch (error) {
      showToast("Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleLoadPrevious = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const totalComments = comments.length;
  const publishedCount = comments.filter(
    (c) => c.status === "published",
  ).length;

  return (
    <section className="border-base-content/20 mt-12 border-t pt-8">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        <h2 className="text-base-content text-2xl font-bold">
          Comments ({publishedCount})
        </h2>
      </div>

      <CommentForm onSubmit={handleSubmitComment} submitting={submitting} />

      <CommentList
        comments={comments}
        currentUserId={user?.userId}
        loading={loading}
      />

      {!loading && totalComments > 0 && (
        <div className="mt-6 flex justify-center gap-2">
          {page > 1 && (
            <button
              className="btn btn-sm btn-outline"
              onClick={handleLoadPrevious}
            >
              Previous
            </button>
          )}
          {hasMore && (
            <button className="btn btn-sm btn-outline" onClick={handleLoadMore}>
              Load More
            </button>
          )}
        </div>
      )}
    </section>
  );
}
