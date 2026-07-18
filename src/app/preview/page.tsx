"use client";

import {
  CustomCode,
  CustomImg,
  CustomOL,
  CustomTable,
  CustomUL,
  PreComponent,
} from "@/components/blog/editor/MdComponents";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function Page() {
  const preview: string | null =
    typeof window !== "undefined" ? localStorage.getItem("apus-post") : null;
  const { md, metadata } = JSON.parse(preview ?? "");

  const prettyMd = useMemo(
    () => (
      <div className="max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            h1(props) {
              return (
                <h1 className="mt-8 mb-4 text-3xl font-semibold">
                  {props.children}
                </h1>
              );
            },
            table(props) {
              return <CustomTable props={props} />;
            },
            h2(props) {
              return (
                <h2 className="mt-8 mb-4 text-2xl font-semibold">
                  {props.children}
                </h2>
              );
            },
            h3(props) {
              return (
                <h3 className="mt-8 mb-4 text-xl font-semibold">
                  {props.children}
                </h3>
              );
            },
            p(props) {
              return <p className="my-4 text-lg">{props.children}</p>;
            },
            hr() {
              return <hr className="my-8 border-amber-400" />;
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
          }}
        >
          {md ?? ""}
        </ReactMarkdown>
      </div>
    ),
    [md],
  );
  return <div>{prettyMd}</div>;
}
