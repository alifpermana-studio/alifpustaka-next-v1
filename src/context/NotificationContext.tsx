"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  NotificationContextType,
  Notification,
  NotificationType,
} from "@/types/notification";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (
    message: string,
    type: NotificationType,
    duration: number = 5000,
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, type, message, duration };

    setNotifications((prev) => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value: NotificationContextType = {
    notifications,
    showNotification,
    dismissNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

const NotificationToast = ({
  notification,
  onDismiss,
}: NotificationToastProps) => {
  const { type, message } = notification;

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          container:
            "border-green-500 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        };
      case "error":
        return {
          container:
            "border-red-500 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100",
          icon: <XCircle className="h-5 w-5 text-red-500" />,
        };
      case "warning":
        return {
          container:
            "border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100",
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        };
      case "info":
        return {
          container:
            "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100",
          icon: <Info className="h-5 w-5 text-blue-500" />,
        };
      default:
        return {
          container:
            "border-gray-500 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100",
          icon: <Info className="h-5 w-5 text-gray-500" />,
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
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
