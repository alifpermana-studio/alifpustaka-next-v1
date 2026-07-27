"use client";

import { Modal } from "@/components/ui/modal";
import clsx from "clsx";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ImageCard from "./ImageCard";
import { useModal } from "@/hooks/useModal";
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
} from "./MdComponents";
import { EDITOR_CONSTANTS } from "@/constants/editor";
import { Toolbar } from "./toolbar";

type Props = {
  content: string;
  md: string;
  setMd: Dispatch<SetStateAction<string>>;
  className?: string;
};

export const MarkdownEditor = ({ md, setMd, className = "" }: Props) => {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [bufferImg, setBufferImg] = useState("");

  // History stack for Undo/Redo
  const [historyIndex, setHistoryIndex] = useState(0); // tracks current position in history stack

  const [history, setHistory] = useState<string[]>([]);

  // Debounce timer for changes
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const {
    isOpen: isImgModalOpen,
    openModal: openImgModal,
    closeModal: closeImgModal,
  } = useModal();

  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize history with initial markdown content
  useEffect(() => {
    if (history.length === 0 && md) {
      setHistory([md]);
      setHistoryIndex(0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Track changes in Markdown and update history stack
  const updateContent = (newContent: string) => {
    // Update the displayed content immediately
    setMd(newContent);

    // Clear existing history commit timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timeout to commit the current content to history after a pause (debouncing)
    const newTimeout = setTimeout(() => {
      // Use newContent here, which is the latest content when the timeout fires
      commitToHistory(newContent);
    }, EDITOR_CONSTANTS.HISTORY_DEBOUNCE); // debounce delay before committing to history
    setTypingTimeout(newTimeout);
  };

  // === NEW: Explicitly commit the current Markdown to history ===
  const commitToHistory = (content: string) => {
    // Use the function form of setHistoryIndex to ensure we use the latest state
    setHistoryIndex((prevIndex) => {
      setHistory((prevHistory) => {
        // Truncate forward history
        const newHistory = [...prevHistory.slice(0, prevIndex + 1), content];
        return newHistory;
      });
      return prevIndex + 1;
    });
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
          {md}
        </ReactMarkdown>
      </div>
    ),
    [md],
  );

  return (
    <div
      className={clsx(
        "border-neutral/30 bg-base-300 text-base-content overflow-hidden rounded-2xl border shadow-sm",
        className,
      )}
    >
      {/* Header / Toolbar */}
      <Toolbar
        taRef={taRef}
        openImgModal={openImgModal}
        history={history}
        historyIndex={historyIndex}
        setHistoryIndex={setHistoryIndex}
        md={md}
        setMd={setMd}
        bufferImg={bufferImg}
        setBufferImg={setBufferImg}
        tab={tab}
        setTab={setTab}
        updateContent={updateContent}
      />

      {/* Body */}
      <div className="bg-base-200 rounded-2xl p-3">
        {tab === "edit" ? (
          <div className="h-[80svh] overflow-hidden rounded-2xl">
            <textarea
              ref={taRef}
              value={md}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Write your post in Markdown…"
              rows={2}
              className="border-neutral/30 bg-base-100 text-base-content focus:border-primary focus:ring-primary/50 h-[80svh] w-full resize-y rounded-[1.15rem] border p-4 font-mono text-sm outline-none focus:ring-2"
            />
          </div>
        ) : (
          <div className="border-neutral/30 bg-base-100 h-[80svh] overflow-y-auto rounded-xl border p-6">
            {preview}
          </div>
        )}
      </div>
      <Modal
        isOpen={isImgModalOpen}
        onClose={closeImgModal}
        className={`no-scrollbar block max-w-5xl overflow-auto p-4`}
      >
        <ImageCard
          setImg={(val) => setBufferImg(val)}
          onClose={closeImgModal}
        />
      </Modal>
    </div>
  );
};
