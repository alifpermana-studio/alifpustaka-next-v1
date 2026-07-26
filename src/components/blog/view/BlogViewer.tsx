"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { formatDistanceToNow } from "date-fns";
import { ScrollProgress } from "@/components/blog/ScrollProgress";
import { ShareButton } from "@/components/blog/ShareButton";
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
} from "@/components/blog/editor/MdComponents";

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

export function BlogViewer({ post, postUrl }: BlogViewerProps) {
  const timeAgo = formatDistanceToNow(new Date(post.uploadTime), {
    addSuffix: true,
  });

  return (
    <>
      <ScrollProgress />
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

          <div className="mt-8 flex gap-6">
            <aside className="hidden lg:block lg:w-16">
              <ShareButton title={post.title} url={postUrl} />
            </aside>

            <div className="flex-1">
              <header className="mb-8">
                <h1 className="text-base-content mb-4 text-4xl font-bold">
                  {post.title}
                </h1>

                {post.desc && (
                  <p className="text-base-content mb-4 text-lg">{post.desc}</p>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="info" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="border-base-content flex items-center gap-4 border-t border-b py-4">
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
                    <p className="text-base-content text-sm">{timeAgo}</p>
                  </div>
                </div>
              </header>

              <div className="max-w-none">
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

              {post.footnote && (
                <footer className="border-base-content/20 mt-8 border-t pt-8">
                  <p className="text-base-content/70 text-sm">
                    {post.footnote}
                  </p>
                </footer>
              )}

              <div className="mt-8 lg:hidden">
                <ShareButton title={post.title} url={postUrl} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
