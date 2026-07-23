"use client";

import { CheckCheck, ClipboardCopy } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { BlogImageModal } from "./BlogImageModal";

type PreProps = {
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLPreElement>,
    HTMLPreElement
  >;
};

export const PreComponent = ({ props }: PreProps) => {
  const [isCopy, setIsCopy] = useState(false);

  const extractString = (obj: string | any | any[]): string => {
    if (typeof obj === "string") return obj;
    else if (obj?.props?.children) {
      if (Array.isArray(obj.props.children)) {
        return obj.props.children
          .map((child: any) => extractString(child))
          .join("");
      }
      return extractString(obj.props.children);
    } else return "";
  };

  const extractLanguage = (children: any): string => {
    if (children?.props?.className) {
      const match = children.props.className.match(/language-(\w+)/);
      return match ? match[1] : "";
    }
    return "";
  };

  const extractCode = (children: any): string => {
    if (typeof children === "string") return children;
    if (children?.props?.children) {
      return extractString(children.props.children);
    }
    return extractString(children);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(extractString(props.children));
    setIsCopy(true);
    setTimeout(() => setIsCopy(false), 2000);
  };

  const language = extractLanguage(props.children);
  const code = extractCode(props.children);
  const lines = code.split("\n");

  return (
    <pre className="border-neutral/30 bg-base-300 relative my-8 overflow-x-auto rounded-lg border p-6">
      {language && (
        <div className="text-neutral-content absolute top-0 left-0 px-4 py-2 text-xs font-semibold tracking-wider uppercase opacity-60">
          {language}
        </div>
      )}
      <div className="relative">
        <div
          onClick={(e) => handleCopy(e)}
          className="text-neutral-content hover:bg-base-200 absolute top-0 right-0 cursor-pointer rounded-md p-2 transition-colors"
        >
          {isCopy ? (
            <div title="Copied" className="text-success">
              <CheckCheck size={18} />
            </div>
          ) : (
            <div title="Copy">
              <ClipboardCopy size={18} />
            </div>
          )}
        </div>
        <div className="flex">
          <div className="text-neutral-content pr-4 text-right text-sm opacity-40 select-none">
            {lines.map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          <div className="flex-1">{props.children}</div>
        </div>
      </div>
    </pre>
  );
};

type UlProps = {
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLUListElement>,
    HTMLUListElement
  >;
};

export const CustomUL = ({ props }: UlProps) => {
  const contentList = props.children as any[];
  return (
    <ul className="marker:text-primary my-3 ml-0 list-disc space-y-3 pl-6">
      {contentList.map((li, i) => {
        if (typeof li === "string") {
          return null;
        } else {
          if (typeof li.props.children === "string") {
            // Split the content by newlines and map to JSX
            const renderContent = li.props.children
              .split("\n")
              .map((part: string, index: number) => (
                <p key={index}>
                  {part}
                  {index < li.props.children.split("\n").length - 1 && <br />}
                </p>
              ));

            return (
              <li className="leading-relaxed" key={i}>
                {renderContent}
              </li>
            );
          } else {
            return (
              <li className="leading-relaxed" key={i}>
                {li.props.children}
              </li>
            );
          }
        }
      })}
    </ul>
  );
};

type OlProps = {
  props: React.DetailedHTMLProps<
    React.OlHTMLAttributes<HTMLOListElement>,
    HTMLOListElement
  >;
};

export const CustomOL = ({ props }: OlProps) => {
  const contentList = props.children as any[];
  return (
    <ol className="marker:text-primary my-3 ml-0 list-decimal space-y-2 pl-6">
      {contentList.map((li, i) => {
        if (typeof li === "string") {
          return null;
        } else {
          if (typeof li.props.children === "string") {
            // Split the content by newlines and map to JSX
            const renderContent = li.props.children
              .split("\n")
              .map((part: string, index: number) => (
                <p key={index}>
                  {part}
                  {index < li.props.children.split("\n").length - 1 && <br />}
                </p>
              ));

            return (
              <li className="leading-relaxed" key={i}>
                {renderContent}
              </li>
            );
          } else {
            return (
              <li className="leading-relaxed" key={i}>
                {li.props.children}
              </li>
            );
          }
        }
      })}
    </ol>
  );
};

type ImgProps = {
  props: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
};

export const CustomImg = ({ props }: ImgProps) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (props.src && typeof props.src === "string") {
    const imageLoader = ({ src }: { src: string }) => {
      return src;
    };
    return (
      <>
        <figure className="my-10">
          <div
            className="border-neutral/20 cursor-zoom-in overflow-hidden rounded-lg border transition-shadow hover:shadow-lg"
            onClick={() => setIsZoomOpen(true)}
          >
            <Image
              loader={imageLoader}
              src={props.src}
              alt={props.alt || "Blog image"}
              width={1200}
              height={800}
              className="h-auto w-full object-contain transition-transform hover:scale-105"
            />
          </div>
          {props.alt && (
            <figcaption className="text-neutral-content mt-3 text-center text-sm italic opacity-70">
              {props.alt}
            </figcaption>
          )}
        </figure>
        <BlogImageModal
          src={props.src}
          alt={props.alt || "Blog image"}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
        />
      </>
    );
  }
};

type CodeProps = {
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >;
};

export const CustomCode = ({ props }: CodeProps) => {
  if (props.className) {
    return <code {...props}>{props.children}</code>;
  } else {
    return (
      <code className="bg-base-300 text-primary rounded px-2 py-0.5 font-mono text-sm">
        {props.children}
      </code>
    );
  }
};

type TableProps = {
  props: React.DetailedHTMLProps<
    React.TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >;
};

export const CustomTable = ({ props }: TableProps) => {
  return (
    <div className="border-neutral/30 my-8 overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse">{props.children}</table>
    </div>
  );
};

type TheadProps = {
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableSectionElement>,
    HTMLTableSectionElement
  >;
};

export const CustomThead = ({ props }: TheadProps) => {
  return <thead className="bg-base-300 text-left">{props.children}</thead>;
};

type TbodyProps = {
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableSectionElement>,
    HTMLTableSectionElement
  >;
};

export const CustomTbody = ({ props }: TbodyProps) => {
  return <tbody>{props.children}</tbody>;
};

type TrProps = {
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableRowElement>,
    HTMLTableRowElement
  >;
};

export const CustomTr = ({ props }: TrProps) => {
  return (
    <tr className="border-neutral/20 even:bg-base-200/50 border-b">
      {props.children}
    </tr>
  );
};

type ThProps = {
  props: React.DetailedHTMLProps<
    React.ThHTMLAttributes<HTMLTableHeaderCellElement>,
    HTMLTableHeaderCellElement
  >;
};

export const CustomTh = ({ props }: ThProps) => {
  return (
    <th className="text-base-content px-4 py-3 font-semibold">
      {props.children}
    </th>
  );
};

type TdProps = {
  props: React.DetailedHTMLProps<
    React.TdHTMLAttributes<HTMLTableDataCellElement>,
    HTMLTableDataCellElement
  >;
};

export const CustomTd = ({ props }: TdProps) => {
  return <td className="text-base-content px-4 py-3">{props.children}</td>;
};

type BlockquoteProps = {
  props: React.DetailedHTMLProps<
    React.BlockquoteHTMLAttributes<HTMLQuoteElement>,
    HTMLQuoteElement
  >;
};

export const CustomBlockquote = ({ props }: BlockquoteProps) => {
  return (
    <blockquote className="border-primary bg-base-200 my-6 border-l-4 py-4 pr-4 pl-6 italic">
      {props.children}
    </blockquote>
  );
};

type LinkProps = {
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >;
};

export const CustomLink = ({ props }: LinkProps) => {
  return (
    <a
      {...props}
      className="text-primary decoration-primary/30 hover:decoration-primary underline underline-offset-2 transition-colors"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {props.children}
    </a>
  );
};
