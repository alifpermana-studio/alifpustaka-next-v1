"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  triggerRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle mounting/unmounting with delay for animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // Delay unmounting to allow fade-out animation
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Match transition duration
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    const calculatePosition = () => {
      if (!triggerRef?.current || !dropdownRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = triggerRect.bottom + window.scrollY + 8;
      let left = triggerRect.right + window.scrollX - dropdownRect.width;

      // Check if dropdown overflows bottom of viewport
      if (triggerRect.bottom + dropdownRect.height + 8 > viewportHeight) {
        // Position above the trigger instead
        top = triggerRect.top + window.scrollY - dropdownRect.height - 8;
      }

      // Check if dropdown overflows left of viewport
      if (left < 0) {
        left = triggerRect.left + window.scrollX;
      }

      // Check if dropdown overflows right of viewport
      if (left + dropdownRect.width > viewportWidth) {
        left = viewportWidth - dropdownRect.width - 16 + window.scrollX;
      }

      setPosition({ top, left });
    };

    if (shouldRender) {
      calculatePosition();
      // Recalculate on scroll or resize
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);

      return () => {
        window.removeEventListener("scroll", calculatePosition, true);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [shouldRender, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef?.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose, triggerRef]);

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className={`shadow-theme-lg fixed z-9999 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>,
    document.body,
  );
};
