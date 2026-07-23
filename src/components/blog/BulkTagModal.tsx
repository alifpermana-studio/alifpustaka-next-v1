import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { Tags, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (action: "add" | "remove", tags: string[]) => void;
}

export function BulkTagModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}: BulkTagModalProps) {
  const [addTagsInput, setAddTagsInput] = useState("");
  const [removeTagsInput, setRemoveTagsInput] = useState("");

  const parseTags = (input: string): string[] => {
    return input
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  const handleAddTags = () => {
    const tags = parseTags(addTagsInput);
    if (tags.length > 0) {
      onConfirm("add", tags);
    }
  };

  const handleRemoveTags = () => {
    const tags = parseTags(removeTagsInput);
    if (tags.length > 0) {
      onConfirm("remove", tags);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-accent/15 p-2">
            <Tags className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-base-content">
              Manage Tags
            </h2>
            <p className="mt-2 text-sm text-base-content/70">
              Add or remove tags from all selected posts.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-base-content mb-1.5 block flex items-center gap-2">
              <Plus className="h-4 w-4 text-success" />
              Add Tags
            </label>
            <input
              type="text"
              value={addTagsInput}
              onChange={(e) => setAddTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="border-base-300 bg-base-200 text-base-content focus:border-accent focus:ring-accent h-10 w-full rounded-xl border px-4 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"
            />
            <p className="mt-1 text-xs text-base-content/50">
              Separate tags with commas
            </p>
          </div>

          <div className="border-t border-base-300 pt-4">
            <label className="text-sm font-medium text-base-content mb-1.5 block flex items-center gap-2">
              <Minus className="h-4 w-4 text-danger" />
              Remove Tags
            </label>
            <input
              type="text"
              value={removeTagsInput}
              onChange={(e) => setRemoveTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="border-base-300 bg-base-200 text-base-content focus:border-accent focus:ring-accent h-10 w-full rounded-xl border px-4 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"
            />
            <p className="mt-1 text-xs text-base-content/50">
              Separate tags with commas
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-base-300/50 p-3">
          <div className="text-sm text-base-content">
            <span className="font-semibold">{selectedCount}</span> post{selectedCount !== 1 ? "s" : ""} selected
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex gap-2">
            {parseTags(removeTagsInput).length > 0 && (
              <Button variant="danger" size="sm" onClick={handleRemoveTags}>
                Remove Tags
              </Button>
            )}
            {parseTags(addTagsInput).length > 0 && (
              <Button variant="primary" size="sm" onClick={handleAddTags}>
                Add Tags
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
