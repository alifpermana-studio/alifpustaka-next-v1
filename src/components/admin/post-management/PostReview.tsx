"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useNotification } from "@/context/NotificationContext";
import { useState, useEffect, useMemo } from "react";
import { PostStatus } from "apus-post";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import {
  CustomCode,
  CustomImg,
  CustomOL,
  CustomTable,
  CustomUL,
  PreComponent,
  CustomBlockquote,
  CustomLink,
  CustomThead,
  CustomTbody,
  CustomTr,
  CustomTh,
  CustomTd,
} from "@/components/post/editor/MdComponents";

interface PostReviewDetail {
  id: string;
  title: string;
  slug: string;
  desc: string | null;
  image: string;
  footnote: string;
  status: PostStatus;
  content: string;
  tags: string[];
  uploadTime: Date;
  updatedAt?: Date;
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    role: string;
  };
}

interface PostReviewProps {
  slug: string;
}

const STATUS_BADGE_CONFIG: Record<PostStatus, { variant: any; label: string }> = {
  drafted: { variant: "neutral", label: "Drafted" },
  submitted: { variant: "warning", label: "Submitted" },
  published: { variant: "success", label: "Published" },
  deleted: { variant: "danger", label: "Deleted" },
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function PostReview({ slug }: PostReviewProps) {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();
  const { fetchNotifications } = useNotification();
  const router = useRouter();

  const [post, setPost] = useState<PostReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [footnote, setFootnote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/posts/review/${slug}`);
        const result = await response.json();

        if (result.success) {
          setPost(result.data);
          setFootnote(result.data.footnote || "");
        } else {
          if (result.error?.code === "insufficient_permissions") {
            setPermissionError(result.error.message);
          } else {
            showToast(result.error?.message || "Failed to fetch post", "error");
          }
        }
      } catch (error) {
        showToast("Failed to fetch post", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, showToast]);

  const handleReview = async (action: "approve" | "reject") => {
    if (!post) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/posts/review/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, footnote }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          action === "approve"
            ? "Post approved and published"
            : "Post rejected and sent to draft",
          "success"
        );
        fetchNotifications();
        router.push("/admin/post-management");
      } else {
        showToast(result.error?.message || "Failed to review post", "error");
      }
    } catch (error) {
      showToast("Failed to review post", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const preview = useMemo(
    () => (
      <div className="max-w-none px-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            h1(props) {
              return (
                <h1 className="mt-12 mb-6 text-4xl font-bold first:mt-0 md:text-5xl">
                  {props.children}
                </h1>
              );
            },
            h2(props) {
              return (
                <h2 className="mt-10 mb-5 text-3xl font-bold md:text-4xl">
                  {props.children}
                </h2>
              );
            },
            h3(props) {
              return (
                <h3 className="mt-8 mb-4 text-2xl font-semibold md:text-3xl">
                  {props.children}
                </h3>
              );
            },
            h4(props) {
              return (
                <h4 className="mt-6 mb-3 text-xl font-semibold md:text-2xl">
                  {props.children}
                </h4>
              );
            },
            h5(props) {
              return (
                <h5 className="mt-4 mb-2 text-lg font-semibold md:text-xl">
                  {props.children}
                </h5>
              );
            },
            h6(props) {
              return (
                <h6 className="mt-4 mb-2 text-base font-semibold md:text-lg">
                  {props.children}
                </h6>
              );
            },
            p(props) {
              return (
                <p className="leading-relaxed">
                  {props.children}
                </p>
              );
            },
            hr() {
              return <hr className="border-primary/30 my-12" />;
            },
            blockquote(props) {
              return <CustomBlockquote props={props} />;
            },
            a(props) {
              return <CustomLink props={props} />;
            },
            img(props) {
              return <CustomImg props={props} />;
            },
            code(props) {
              return <CustomCode props={props} />;
            },
            ol(props) {
              return <CustomOL props={props} />;
            },
            ul(props) {
              return <CustomUL props={props} />;
            },
            pre(props) {
              return <PreComponent props={props} />;
            },
            table(props) {
              return <CustomTable props={props} />;
            },
            thead(props) {
              return <CustomThead props={props} />;
            },
            tbody(props) {
              return <CustomTbody props={props} />;
            },
            tr(props) {
              return <CustomTr props={props} />;
            },
            th(props) {
              return <CustomTh props={props} />;
            },
            td(props) {
              return <CustomTd props={props} />;
            },
          }}
        >
          {post?.content || ""}
        </ReactMarkdown>
      </div>
    ),
    [post?.content],
  );

  if (!hasPermission("review_posts")) {
    return (
      <div className="p-6">
        <h1 className="text-base-content text-2xl font-bold">Access Denied</h1>
        <p className="text-base-content/70 mt-2">
          You don't have permission to review posts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-base-content/70">Loading post...</p>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="p-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/admin/post-management")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Button>
        <h1 className="text-base-content text-2xl font-bold">Cannot Review Post</h1>
        <p className="text-base-content/70 mt-2">{permissionError}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <h1 className="text-base-content text-2xl font-bold">Post Not Found</h1>
      </div>
    );
  }

  const formattedSubmitDate = new Date(post.uploadTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedUpdateDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/admin/post-management")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-base-content text-3xl font-bold">{post.title}</h1>
            <div className="mt-3 flex items-center gap-3">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-sm">
                  {getInitials(post.author.name)}
                </div>
              )}
              <div>
                <div className="text-base-content font-medium">{post.author.name}</div>
                {post.author.username && (
                  <div className="text-base-content/60 text-sm">@{post.author.username}</div>
                )}
              </div>
            </div>
          </div>
          <Badge variant={STATUS_BADGE_CONFIG[post.status].variant}>
            {STATUS_BADGE_CONFIG[post.status].label}
          </Badge>
        </div>

        <div className="mt-6 border-t border-base-300 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <span className="text-base-content/60 text-sm">Submitted:</span>
              <span className="text-base-content ml-2 text-sm">{formattedSubmitDate}</span>
            </div>
            {formattedUpdateDate && (
              <div>
                <span className="text-base-content/60 text-sm">Last Updated:</span>
                <span className="text-base-content ml-2 text-sm">{formattedUpdateDate}</span>
              </div>
            )}
          </div>
          {post.tags.length > 0 && (
            <div className="mt-3">
              <span className="text-base-content/60 text-sm">Tags:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-200 p-6">
        <h2 className="text-base-content mb-4 text-xl font-semibold">Post Content</h2>
        <div className="border-neutral/30 bg-base-100 overflow-y-auto rounded-xl border p-6">
          {preview}
        </div>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-200 p-6">
        <h2 className="text-base-content mb-4 text-xl font-semibold">Editor Review</h2>
        <textarea
          value={footnote}
          onChange={(e) => setFootnote(e.target.value)}
          placeholder="Add your review comments here..."
          rows={6}
          className="border-base-300 bg-base-100 text-base-content focus:border-accent focus:ring-accent w-full rounded-xl border p-4 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"
        />
        <div className="text-base-content/60 mt-2 text-xs">
          {footnote.length} characters
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="danger"
            onClick={() => handleReview("reject")}
            disabled={submitting}
          >
            Reject & Send to Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleReview("approve")}
            disabled={submitting}
          >
            Approve & Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
