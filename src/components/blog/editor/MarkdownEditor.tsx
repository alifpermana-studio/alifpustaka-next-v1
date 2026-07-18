"use client";

import { Modal } from "@/components/ui/modal";
import clsx from "clsx";
import React, {
  Dispatch,
  RefObject,
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
} from "./MdComponents";

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
    }, 500); // 500ms debounce delay before committing to history
    setTypingTimeout(newTimeout);
  };

  // === NEW: Explicitly commit the current Markdown to history ===
  const commitToHistory = (content: string) => {
    // Use the function form of setHistory and setHistoryIndex to ensure we use the latest state
    setHistory((prevHistory) => {
      // Truncate forward history
      const newHistory = [...prevHistory.slice(0, historyIndex + 1), content];
      return newHistory;
    });
    setHistoryIndex((prevIndex) => prevIndex + 1);
  };

  const preview = useMemo(
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
          {md}
        </ReactMarkdown>
      </div>
    ),
    [md],
  );

  return (
    <div
      className={clsx(
        "overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 text-gray-300 shadow-sm",
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
      <div className="rounded-2xl bg-gray-800 p-3">
        {tab === "edit" ? (
          <div className="h-[80svh] overflow-hidden rounded-2xl">
            <textarea
              ref={taRef}
              value={md}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Write your post in Markdown…"
              rows={2}
              className="h-[80svh] w-full resize-y rounded-[1.15rem] border border-gray-600 bg-gray-900 p-4 font-mono text-sm text-gray-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-gray-600 bg-gray-900 p-4">
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

type ToolbarProps = {
  taRef: RefObject<HTMLTextAreaElement | null>;
  openImgModal: () => void;
  history: string[];
  historyIndex: number;
  setHistoryIndex: Dispatch<SetStateAction<number>>;
  md: string;
  setMd: Dispatch<SetStateAction<string>>;
  bufferImg: string;
  setBufferImg: Dispatch<SetStateAction<string>>;
  tab: string;
  setTab: Dispatch<SetStateAction<"edit" | "preview">>;
  updateContent: (val: string) => void;
};

const Toolbar = ({
  taRef,
  tab,
  setTab,
  md,
  setMd,
  history,
  historyIndex,
  setHistoryIndex,
  openImgModal,
  bufferImg,
  updateContent,
}: ToolbarProps) => {
  // === Shortcuts ===
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only proceed if a modifier key (Ctrl or Cmd/Meta) is pressed
      const isModifierPressed = e.metaKey || e.ctrlKey;
      if (!isModifierPressed) return;

      // Convert key to lowercase for consistent checking
      const k = e.key.toLowerCase();

      // Prevent default browser actions for all handled shortcuts
      if (k === "b" || k === "i" || k === "u" || k === "z" || k === "y") {
        e.preventDefault();
      }

      if (k === "b") {
        toggleBold();
      } else if (k === "i") {
        toggleItalic();
      } else if (k === "u") {
        toggleUnderline();
      } else if (k === "z") {
        // Handle Undo (Ctrl/Cmd + Z)
        // Check for Ctrl+Shift+Z or Cmd+Shift+Z for Redo (Mac convention)
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (k === "y") {
        // Handle Redo (Ctrl + Y) - Windows/Linux convention
        // Note: Mac users primarily rely on Cmd+Shift+Z, but Ctrl+Y is standard on other OSes
        redo();
      }
      // 's' (save) is still typically ignored/reserved for browser functionality
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [history, historyIndex]); // Depend on history and historyIndex for correct undo/redo state access

  useEffect(() => {
    if (bufferImg) insertBlock(`![Image](${bufferImg})`);
  }, [bufferImg]);

  // === Inline toggle helper (handles trim, whitespace, wrap/unwrap) ===
  const toggleInline = (
    prefix: string,
    suffix = prefix,
    placeholder = "text",
  ) => {
    const ta = taRef.current;
    if (!ta) return;

    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;

    // If no selection, expand to word at cursor
    let selStart = start;
    let selEnd = end;
    if (selStart === selEnd) {
      selStart = start;
      while (selStart > 0 && !/\s/.test(md[selStart - 1])) selStart--;
      selEnd = end;
      while (selEnd < md.length && !/\s/.test(md[selEnd])) selEnd++;
    }

    const before = md.slice(0, selStart);
    const inner = md.slice(selStart, selEnd);
    const after = md.slice(selEnd);

    // If selection is empty spaces, just insert placeholder wrapped
    const leadingWS = inner.match(/^\s+/)?.[0] ?? "";
    const trailingWS = inner.match(/\s+$/)?.[0] ?? "";
    const coreRaw = inner.slice(
      leadingWS.length,
      inner.length - trailingWS.length,
    );
    const core = coreRaw || placeholder;

    const selHas = (pfx: string, sfx: string) =>
      inner.startsWith(pfx) &&
      inner.endsWith(sfx) &&
      inner.length >= pfx.length + sfx.length;

    const outsideHas =
      md.slice(selStart - prefix.length, selStart) === prefix &&
      md.slice(selEnd, selEnd + suffix.length) === suffix;

    // Unwrap if wrapped
    if (selHas(prefix, suffix)) {
      const content = inner.slice(prefix.length, inner.length - suffix.length);
      const next = before + content + after;
      updateContent(next);
      return;
    }

    // Unwrap if markers are just outside the selection
    if (outsideHas) {
      const wrapStart = selStart - prefix.length;
      const wrapEnd = selEnd + suffix.length;
      const wrapped = md.slice(wrapStart, wrapEnd);
      const content = wrapped.slice(
        prefix.length,
        wrapped.length - suffix.length,
      );
      const next = md.slice(0, wrapStart) + content + md.slice(wrapEnd);
      updateContent(next);
      return;
    }

    // Otherwise wrap, preserving leading/trailing spaces outside markers
    const wrapped = `${leadingWS}${prefix}${core}${suffix}${trailingWS}`;
    const next = before + wrapped + after;
    updateContent(next);
  };

  const toggleBold = () => toggleInline("**");
  const toggleItalic = () => toggleInline("*");
  const toggleStrike = () => toggleInline("~~");
  // Underline uses HTML tags (Markdown has no native underline)
  const toggleUnderline = () => toggleInline("<u>", "</u>");

  // === Block insert helper ===
  const insertBlock = (block: string, fallback = "") => {
    if (fallback) {
      console.log("insertBlock fallback: ", fallback);
    }
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;

    const before = md.slice(0, start);
    const after = md.slice(start);

    const sep = before.endsWith("\n") || before.length === 0 ? "" : "\n";
    const endingNewline = block.endsWith("\n") ? "" : "\n";
    const next = before + sep + block + endingNewline + after;

    updateContent(next);
  };

  // === Undo/Redo ===
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMd(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMd(history[historyIndex + 1]);
    }
  };

  const insertImage = () => {
    openImgModal();
  };

  return (
    <div className="flex items-center justify-between gap-2 divide-x divide-gray-600/70 bg-gray-900 p-3">
      <div className="flex flex-wrap gap-2">
        {/* Undo/Redo buttons */}
        <ToolbarButton onClick={undo} title="Undo (Ctrl/⌘Z)">
          ↺ Undo
        </ToolbarButton>
        <ToolbarButton onClick={redo} title="Redo (Ctrl/⌘Y)">
          ↻ Redo
        </ToolbarButton>

        {/* Inline toggles */}
        <ToolbarButton onClick={toggleBold} title="Bold (Ctrl/⌘B)">
          **B**
        </ToolbarButton>
        <ToolbarButton onClick={toggleUnderline} title="Underline (Ctrl/⌘U)">
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton onClick={toggleItalic} title="Italic (Ctrl/⌘I)">
          *i*
        </ToolbarButton>
        <ToolbarButton onClick={toggleStrike} title="Strikethrough">
          ~~S~~
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-600" />

        {/* Headings */}
        <ToolbarButton onClick={() => insertBlock("# Heading")} title="H1">
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => insertBlock("## Heading")} title="H2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => insertBlock("### Heading")} title="H3">
          H3
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-600" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => insertBlock("- List item")}
          title="Bulleted List"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => insertBlock("1. First item")}
          title="Numbered List"
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => insertBlock("- [ ] Task item")}
          title="Task List (GFM)"
        >
          [ ] Task
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-600" />

        {/* Code / etc */}
        <ToolbarButton
          onClick={() => insertBlock("```lang\ncode\n```", "code")}
          title="Code Block"
        >
          ` code `
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleInline("`", "`", "inline")}
          title="Inline Code"
        >
          `inline`
        </ToolbarButton>
        <ToolbarButton
          onClick={() => insertBlock("> Quote")}
          title="Blockquote"
        >
          ❝ ❞
        </ToolbarButton>
        <ToolbarButton
          onClick={() => insertBlock("---")}
          title="Horizontal Rule"
        >
          ———
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-600" />

        {/* Link / Image */}
        <ToolbarButton
          onClick={() => toggleInline("[", "](https://)", "link-text")}
          title="Link"
        >
          🔗
        </ToolbarButton>
        <ToolbarButton onClick={insertImage} title="Insert Image">
          🖼
        </ToolbarButton>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("edit")}
          className={clsx(
            "rounded-lg px-3 py-1 text-sm",
            tab === "edit"
              ? "border border-gray-600 bg-gray-700 shadow-sm"
              : "hover:bg-gray-600",
          )}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={clsx(
            "rounded-lg px-3 py-1 text-sm",
            tab === "preview"
              ? "border border-gray-600 bg-gray-700 shadow-sm"
              : "hover:bg-gray-600",
          )}
        >
          Preview
        </button>
      </div>
    </div>
  );
};

const BUTTON_BASE =
  "text-sm px-2 py-1 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 active:scale-95 transition";

const ToolbarButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, ...props }) => (
  <button
    type="button"
    className={clsx(BUTTON_BASE, "shadow-sm", className)}
    {...props}
  >
    {children}
  </button>
);
