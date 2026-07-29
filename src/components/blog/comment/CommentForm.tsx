import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthPromptModal } from "./AuthPromptModal";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  submitting: boolean;
}

export function CommentForm({ onSubmit, submitting }: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const remainingChars = 500 - content.length;
  const isValid = content.trim().length > 0 && content.length <= 500;

  const handleTextareaClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setIsFocused(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!isValid) return;

    await onSubmit(content.trim());
    setContent("");
    setIsFocused(false);
  };

  const handleCancel = () => {
    setContent("");
    setIsFocused(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="form-control flex flex-col gap-4">
          <label className="label flex justify-between">
            <span className="label-text font-semibold">Leave a Comment</span>
            {isFocused && (
              <span
                className={`label-text-alt ${remainingChars < 0 ? "text-error" : "text-base-content/60"}`}
              >
                {remainingChars} characters remaining
              </span>
            )}
          </label>
          <textarea
            className="textarea textarea-bordered bg-base-200 h-24 resize-none rounded-lg p-2"
            placeholder={
              user ? "Share your thoughts..." : "Sign in to leave a comment"
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onClick={handleTextareaClick}
            onFocus={() => user && setIsFocused(true)}
            disabled={submitting}
          />
          {isFocused && user && (
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Supports basic markdown: **bold**, *italic*, [links](url),
                lists, `blockquotes`
              </span>
            </label>
          )}
        </div>

        {isFocused && user && (
          <div className="mt-3 flex justify-end gap-4">
            <button
              type="button"
              className="cursor-pointer"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-content cursor-pointer rounded-lg px-4 py-1 text-lg font-semibold"
              disabled={!isValid || submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        )}
      </form>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
