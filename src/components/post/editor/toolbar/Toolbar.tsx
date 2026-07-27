import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarProps } from "apus-editor";

export const Toolbar = ({
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
  // === Undo/Redo ===
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMd(history[historyIndex - 1]);
    }
  }, [historyIndex, history, setHistoryIndex, setMd]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMd(history[historyIndex + 1]);
    }
  }, [historyIndex, history, setHistoryIndex, setMd]);

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
  const insertBlock = (block: string) => {
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

  const insertImage = () => {
    openImgModal();
  };

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
  }, [undo, redo, toggleBold, toggleItalic, toggleUnderline]);

  useEffect(() => {
    if (bufferImg) insertBlock(`![Image](${bufferImg})`);
  }, [bufferImg]); // eslint-disable-line react-hooks/exhaustive-deps

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
          onClick={() => insertBlock("```lang\ncode\n```")}
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
