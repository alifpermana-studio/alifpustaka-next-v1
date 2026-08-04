"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import { RotateCcw, ZoomIn, ZoomOut, X } from "lucide-react";

const WRAPPER_MIN_SCALE = 1;
const WRAPPER_MAX_SCALE = 4;

interface TransformCallbackRef {
  state: {
    scale: number;
    positionX: number;
    positionY: number;
  };
  instance: unknown;
}

type ControlProps = {
  isMaxScale: boolean;
  isMinScale: boolean;
};

const Controls = ({ isMaxScale, isMinScale }: ControlProps) => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-0 inset-x-0 z-999 flex w-full flex-row items-center justify-center gap-4 p-8"
    >
      <button
        onClick={() => zoomIn()}
        disabled={isMaxScale}
        title="Zoom In"
        className="scale-100 rounded-full bg-neutral/50 p-3 font-semibold text-neutral-content backdrop-blur-lg transition-transform duration-150 ease-in-out hover:scale-110 active:scale-125 disabled:bg-neutral/20 disabled:hover:scale-100"
      >
        <ZoomIn />
      </button>
      <button
        onClick={() => zoomOut()}
        disabled={isMinScale}
        title="Zoom Out"
        className="scale-100 rounded-full bg-neutral/50 p-3 font-semibold text-neutral-content backdrop-blur-lg transition-transform duration-150 ease-in-out hover:scale-110 active:scale-125 disabled:bg-neutral/20 disabled:hover:scale-100"
      >
        <ZoomOut />
      </button>
      <button
        onClick={() => resetTransform()}
        disabled={isMinScale}
        title="Reset"
        className="scale-100 rounded-full bg-neutral/50 p-3 font-semibold text-neutral-content backdrop-blur-lg transition-transform duration-150 ease-in-out hover:scale-110 active:scale-125 disabled:bg-neutral/20 disabled:hover:scale-100"
      >
        <RotateCcw />
      </button>
    </div>
  );
};

interface BlogImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogImageModal({
  src,
  alt,
  isOpen,
  onClose,
}: BlogImageModalProps) {
  const [isMaxScale, setIsMaxScale] = useState(false);
  const [isMinScale, setIsMinScale] = useState(true);
  const [currentScale, setCurrentScale] = useState(1);

  const handleTransform = useCallback((ref: TransformCallbackRef) => {
    const newScale = ref.state.scale;
    setCurrentScale(newScale);
    setIsMinScale(newScale <= WRAPPER_MIN_SCALE);
    setIsMaxScale(newScale >= WRAPPER_MAX_SCALE);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 z-99999 flex items-center justify-center overflow-auto">
      <TransformWrapper
        initialScale={1}
        minScale={WRAPPER_MIN_SCALE}
        maxScale={WRAPPER_MAX_SCALE}
        limitToBounds={true}
        centerOnInit={true}
        onTransform={handleTransform}
      >
        <div className="absolute inset-0 z-9 h-full w-screen bg-base-300/80 backdrop-blur-lg"></div>

        <button
          onClick={handleClose}
          className="fixed top-3 right-3 z-99 flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-base-content transition-colors hover:bg-base-300 sm:top-6 sm:right-6 sm:h-12 sm:w-12"
          title="Close (Esc)"
        >
          <X size={24} />
        </button>

        <Controls isMaxScale={isMaxScale} isMinScale={isMinScale} />

        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%",
            zIndex: "20",
          }}
          contentStyle={{
            width: "100%",
            height: "100%",
          }}
        >
          <div
            className="absolute inset-0 z-9 h-full w-screen"
            onClick={handleClose}
          ></div>
          <div className="relative z-20 m-auto p-8">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              className="object-contain"
              priority
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
