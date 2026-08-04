"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { ScrollProgress } from "@/components/blog/ScrollProgress";
import { ShareButton } from "@/components/blog/ShareButton";
import { TableOfContents } from "@/components/blog/view/TableOfContents";
import { Badge } from "@/components/ui/Badge";
import {
  CustomBlockquote,
  CustomLink,
  CustomImg,
  CustomCode,
  CustomOL,
  CustomUL,
  PreComponent,
  CustomTable,
  CustomThead,
  CustomTbody,
  CustomTr,
  CustomTh,
  CustomTd,
} from "@/components/blog/MdComponents";
import { useRef, useState } from "react";
import { useScroll } from "framer-motion";
import { CommentSection } from "@/components/blog/comment/CommentSection";

interface PostData {
  id: string;
  title: string;
  slug: string;
  desc: string | null;
  image: string;
  content: string;
  footnote: string;
  uploadTime: string;
  updatedAt: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

interface BlogViewerProps {
  post: PostData;
  postUrl: string;
}

function slugify(text: string | React.ReactNode): string {
  const textString = typeof text === "string" ? text : String(text);
  return textString
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function BlogViewer({ post, postUrl }: BlogViewerProps) {
  const timeAgo = formatDistanceToNow(new Date(post.updatedAt), {
    addSuffix: true,
  });

  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  return (
    <>
      <article className="bg-base-100 min-h-screen pt-20 pb-6">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative mt-8 flex gap-6">
            <aside className="z-10 hidden lg:block lg:w-16">
              <div className="sticky top-24 flex flex-col items-center gap-4">
                <ScrollProgress progress={scrollYProgress} />
                <TableOfContents content={post.content} />
                <ShareButton title={post.title} url={postUrl} />
              </div>
            </aside>

            <div className="relative w-full">
              <header className="mb-8">
                <h1 className="text-base-content mb-4 text-4xl font-bold">
                  {post.title}
                </h1>

                <div className="border-base-content/30 flex items-center gap-4 border-t border-b py-4">
                  {post.author.image && (
                    <Image
                      src={post.author.image}
                      alt={post.author.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-base-content font-semibold">
                      {post.author.name}
                    </p>
                    <p className="text-base-content text-sm">
                      Last updated {timeAgo}
                    </p>
                  </div>
                </div>
              </header>

              <div className="w-full" ref={ref}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
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
                      const id = slugify(props.children);
                      return (
                        <h3
                          id={id}
                          className="mt-8 mb-4 scroll-mt-24 text-2xl font-semibold md:text-3xl"
                        >
                          {props.children}
                        </h3>
                      );
                    },
                    h4(props) {
                      const id = slugify(props.children);
                      return (
                        <h4
                          id={id}
                          className="mt-6 mb-3 scroll-mt-24 text-xl font-semibold md:text-2xl"
                        >
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
                        <p className="leading-relaxed">{props.children}</p>
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
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* {post.footnote && (
                <footer className="border-base-content/20 mt-8 border-t pt-8">
                  <p className="text-base-content/70 text-sm">
                    {post.footnote}
                  </p>
                </footer>
              )} */}

              {/* Mobile Shortcut */}
              <div className="sticky bottom-0 lg:hidden">
                <div className="mb-5 flex items-end gap-2">
                  <ShareButton
                    progress={scrollYProgress}
                    title={post.title}
                    url={postUrl}
                  />
                  <TableOfContents content={post.content} />
                </div>
                <ScrollProgress progress={scrollYProgress} />
              </div>
            </div>
          </div>
          <div className="my-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="info" size="sm">
                {tag}
              </Badge>
            ))}
          </div>

          <CommentSection
            postId={post.id}
            postSlug={post.slug}
            postTitle={post.title}
          />
        </div>
      </article>
    </>
  );
}
