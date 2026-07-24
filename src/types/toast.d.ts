export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (
    message: string,
    type: ToastType,
    duration?: number,
  ) => void;
  dismissToast: (id: string) => void;
}
