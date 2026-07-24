"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ToastContextType,
  Toast,
  ToastType,
} from "@/types/toast";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export const ToastContext = createContext<
  ToastContextType | undefined
>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("notification-portal-anchor"));
  }, []);

  const showToast = (
    message: string,
    type: ToastType,
    duration: number = 5000,
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, type, message, duration };

    setToasts((prev) => {
      const updated = [...prev];
      if (updated.length >= 5) {
        updated.shift();
      }
      updated.push(toast);
      return updated;
    });

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  };

  const value: ToastContextType = {
    toasts,
    showToast,
    dismissToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {portalTarget &&
        createPortal(
          <div className="relative space-y-2 pointer-events-auto pt-4">
            {toasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onDismiss={() => dismissToast(toast.id)}
              />
            ))}
          </div>,
          portalTarget,
        )}
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

const ToastItem = ({
  toast,
  onDismiss,
}: ToastItemProps) => {
  const { type, message } = toast;

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "border-success bg-success text-success-content",
          icon: <CheckCircle className="h-5 w-5 text-success-content" />,
        };
      case "error":
        return {
          container: "border-error bg-error text-error-content",
          icon: <XCircle className="h-5 w-5 text-error-content" />,
        };
      case "warning":
        return {
          container: "border-warning bg-warning text-warning-content",
          icon: <AlertTriangle className="h-5 w-5 text-warning-content" />,
        };
      case "info":
        return {
          container: "border-info bg-info text-info-content",
          icon: <Info className="h-5 w-5 text-info-content" />,
        };
      default:
        return {
          container: "border-base-300 bg-base-200 text-base-content",
          icon: <Info className="h-5 w-5 text-base-content" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`animate-in slide-in-from-right-full flex max-w-md items-center gap-3 rounded-lg border p-4 shadow-lg duration-300 ${styles.container}`}
    >
      <div className="shrink-0">{styles.icon}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
