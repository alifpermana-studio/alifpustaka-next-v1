"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

// ⚠️ IMPORTANT: These MUST match the values set in <TransformWrapper />
const WRAPPER_MIN_SCALE = 1;
const WRAPPER_MAX_SCALE = 4;

interface TransformCallbackRef {
  state: {
    scale: number;
    positionX: number;
    positionY: number;
    // Include other state properties you might use
  };
  instance: any; // Use 'any' for the full instance object as we only need the state
}

type ControlProps = {
  isMaxScale: boolean;
  isMinScale: boolean;
};

const Controls = ({ isMaxScale, isMinScale }: ControlProps) => {
  // We only rely on the functions and the current scale value.
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-x-0 bottom-0 z-999 flex w-full flex-row items-center justify-center gap-4 space-x-2 p-8"
    >
      <button
        onClick={() => zoomIn()}
        disabled={isMaxScale}
        title="Zoom In"
        className="scale-100 rounded-full bg-gray-500/50 p-3 font-semibold text-white backdrop-blur-lg transition-transform duration-150 ease-in-out hover:scale-110 active:scale-125 disabled:bg-gray-400/20 disabled:hover:scale-100"
      >
        <ZoomIn />
      </button>
      <button
        onClick={() => zoomOut()}
        disabled={isMinScale}
        title="Zoom Out"
        className="scale-100 rounded-full bg-gray-500/50 p-3 font-semibold text-white backdrop-blur-lg transition-transform duration-150 ease-in-out hover:scale-110 active:scale-125 disabled:bg-gray-400/20 disabled:hover:scale-100"
      >
        <ZoomOut />
      </button>
      <button
        onClick={() => resetTransform()}
        disabled={isMinScale}
        title="Reset"
        className="scale-100 rounded-full bg-gray-500/50 p-3 font-semibold text-white backdrop-blur-lg transition-transform duration-150 ease-in-out hover:scale-110 active:scale-125 disabled:bg-gray-400/20 disabled:hover:scale-100"
      >
        <RotateCcw />
      </button>
    </div>
  );
};

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  containerWidth?: string;
  containerHeight?: string;
}

function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
  const [isMaxScale, setIsMaxScale] = useState(false);
  const [isMinScale, setIsMinScale] = useState(false);
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  // 1. Use state to track the scale in the parent component
  const [currentScale, setCurrentScale] = useState(1);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  // 2. Define the callback function using useCallback
  const handleTransform = useCallback((ref: TransformCallbackRef) => {
    // This is the function that updates your local state with the new scale
    const newScale = ref.state.scale;
    setCurrentScale(newScale);
  }, []); // Empty dependency array means this function is stable

  // 3. Use the local state (currentScale) as the useEffect dependency
  useEffect(() => {
    const minScale = currentScale <= WRAPPER_MIN_SCALE;
    setIsMinScale(minScale);

    const maxScale = currentScale >= WRAPPER_MAX_SCALE;
    setIsMaxScale(maxScale);
  }, [currentScale]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal fixed inset-0 z-99999 flex items-center justify-center overflow-auto`}
    >
      <TransformWrapper
        initialScale={1}
        minScale={1} // Prevents zooming out smaller than the original size
        maxScale={4}
        limitToBounds={true} // Crucial: Prevents panning the image outside the container
        // You can add options for panning behavior, wheel settings, etc., here
        centerOnInit={true}
        onTransform={handleTransform}
        ref={transformComponentRef}
      >
        <div className="absolute inset-0 z-9 h-full w-screen bg-gray-700/20 backdrop-blur-lg"></div>
        <CloseButton handleClose={handleClose} />

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
            // Style for the zoomed content itself (the image)
            // The library handles the transform properties
          }}
        >
          {/* Your Image Element */}
          <div
            className="absolute inset-0 z-9 h-full w-screen"
            onClick={handleClose}
          ></div>
          <div className={`relative z-20 m-auto overflow-auto p-8`}>
            <Image
              src={src} // Put your image in /public
              alt={alt}
              width={500}
              height={500}
              className="object-contain" // keeps full image visible, no cropping
              priority
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default ImageModal;

type CloseButtonProps = {
  handleClose: (e: React.MouseEvent) => void;
};

const CloseButton = ({ handleClose }: CloseButtonProps) => {
  return (
    <button
      onClick={handleClose}
      className="fixed top-3 right-3 z-99 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:top-6 sm:right-6 sm:h-11 sm:w-11 dark:bg-gray-400/50 dark:text-white dark:hover:bg-gray-500"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};
