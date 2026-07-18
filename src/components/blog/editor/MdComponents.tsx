"use client";

import { CheckCheck, ClipboardCopy } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";

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

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(extractString(props.children));
    setIsCopy(true);
    setTimeout(() => setIsCopy(false), 2000);
  };
  return (
    <pre className="relative my-4 rounded-xl bg-gray-800 bg-none p-3">
      <div className="relative">
        <div
          onClick={(e) => handleCopy(e)}
          className="absolute top-0 right-0 mr-2 cursor-pointer"
        >
          {isCopy ? (
            <div title="Copied">
              <CheckCheck />
            </div>
          ) : (
            <div title="Copy">
              <ClipboardCopy />
            </div>
          )}
        </div>
        {props.children}
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
    <ul className="my-4 ml-5 list-disc pl-5">
      {contentList.map((li, i) => {
        if (typeof li === "string") {
          return null;
        } else {
          if (typeof li.props.children === "string") {
            console.log("Pre: ", li);
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
              <li className="my-2" key={i}>
                {renderContent}
              </li>
            );
            /* return <li key={i}>{`Test`}</li> */
          } else {
            console.log("Pre: ", li);
            return (
              <li className="my-2" key={i}>
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
    <ol className="my-4 ml-5 list-decimal pl-5">
      {contentList.map((li, i) => {
        if (typeof li === "string") {
          return null;
        } else {
          if (typeof li.props.children === "string") {
            console.log("Pre: ", li);
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
              <li className="my-2" key={i}>
                {renderContent}
              </li>
            );
            /* return <li key={i}>{`Test`}</li> */
          } else {
            console.log("Pre: ", li);
            return (
              <li className="my-2" key={i}>
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
  if (props.src) {
    const imageLoader = ({ src }: { src: string }) => {
      return src;
    };
    return (
      <Image
        loader={imageLoader}
        src={`${props.src}`}
        alt="Picture of the author"
        width={500}
        height={500}
      />
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
    return <code className="hljs language-lang">{props.children}</code>;
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
    <table className="table-auto border-collapse border border-gray-400 p-2">
      {props.children}
    </table>
  );
};
