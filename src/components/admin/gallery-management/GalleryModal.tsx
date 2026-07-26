import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { BlockImageModal } from "./BlockImageModal";

interface GalleryListItem {
  id: string;
  title: string;
  slug: string;
  format: string;
  isPrivate: boolean;
  footnote: string | null;
  tags: string[];
  uploadTime: Date;
  updatedAt?: Date;
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    role: string;
  };
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: GalleryListItem | null;
  onBlockSuccess: () => void;
}

export function GalleryModal({ isOpen, onClose, gallery, onBlockSuccess }: GalleryModalProps) {
  const { showToast } = useToast();
  const [footnote, setFootnote] = useState(gallery?.footnote || "");
  const [isBlocking, setIsBlocking] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  if (!gallery) return null;

  const handleBlockImage = async () => {
    if (!footnote.trim()) {
      showToast("Please add a note before blocking", "error");
      return;
    }

    setShowBlockModal(true);
  };

  const handleConfirmBlock = async () => {
    setIsBlocking(true);

    try {
      const response = await fetch(`/api/galleries/${gallery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "block",
          footnote: footnote.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("Image blocked successfully", "success");
        setShowBlockModal(false);
        onClose();
        onBlockSuccess();
      } else {
        showToast(result.error?.message || "Failed to block image", "error");
      }
    } catch (error) {
      showToast("Network error", "error");
    } finally {
      setIsBlocking(false);
    }
  };

  const formattedUploadDate = new Date(gallery.uploadTime).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const formattedUpdateDate = gallery.updatedAt
    ? new Date(gallery.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="overflow-hidden py-4">
      <div className="relative flex h-[90vh] max-w-4xl flex-col overflow-y-auto">
        <div className="border-base-300 bg-base-200 sticky top-0 shrink-0 border-b px-6 pb-4">
          <h2 className="text-base-content text-2xl font-bold">
            {gallery.title}
          </h2>
          <p className="text-base-content/60 text-sm">Slug: {gallery.slug}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-base-300/30 relative mb-6 flex min-h-75 w-full items-center justify-center overflow-hidden rounded-lg">
            <Image
              src={`/api/image?p=${gallery.isPrivate}&src=${gallery.slug}${gallery.format}`}
              alt={gallery.title}
              width={1200}
              height={800}
              className="h-auto max-h-[50vh] w-auto max-w-full object-contain"
            />
          </div>

          <div className="space-y-4 pb-4">
            <div>
              <h3 className="text-base-content mb-2 font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {gallery.tags.length > 0 ? (
                  gallery.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-accent/15 text-accent rounded-full px-3 py-1 text-sm"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-base-content/50 text-sm">No tags</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base-content mb-2 font-semibold">Author</h3>
              <div className="flex items-center gap-3">
                {gallery.author.image ? (
                  <Image
                    src={gallery.author.image}
                    alt={gallery.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="bg-accent/15 text-accent flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                    {gallery.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="text-base-content font-medium">
                    {gallery.author.name}
                  </div>
                  {gallery.author.username && (
                    <div className="text-base-content/60 text-sm">
                      @{gallery.author.username}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-base-content mb-1 font-semibold">
                  Uploaded
                </h3>
                <p className="text-base-content/70 text-sm">
                  {formattedUploadDate}
                </p>
              </div>
              {formattedUpdateDate && (
                <div>
                  <h3 className="text-base-content mb-1 font-semibold">
                    Last Updated
                  </h3>
                  <p className="text-base-content/70 text-sm">
                    {formattedUpdateDate}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-base-300 pt-4 mt-6">
              <h3 className="text-base-content mb-2 font-semibold">
                Admin Notes
              </h3>
              <textarea
                value={footnote}
                onChange={(e) => setFootnote(e.target.value)}
                maxLength={200}
                placeholder="Add notes about this image (required before blocking)..."
                rows={3}
                className="border-base-300 bg-base-200 text-base-content focus:border-accent focus:ring-accent w-full rounded-lg border px-4 py-2 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none resize-none"
              />
              <div className="text-base-content/50 text-xs mt-1 text-right">
                {footnote.length}/200 characters
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="danger"
                onClick={handleBlockImage}
                disabled={isBlocking || !footnote.trim()}
                className="w-full"
              >
                Block Image
              </Button>
              <p className="text-base-content/60 text-xs mt-2 text-center">
                Blocking will make this image private and notify the owner.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BlockImageModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleConfirmBlock}
        imageTitle={gallery.title}
        authorName={gallery.author.name}
        isBlocking={isBlocking}
      />
    </Modal>
  );
}
