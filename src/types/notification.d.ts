export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // auto-dismiss after X ms (default 5000)
}

export interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    message: string,
    type: NotificationType,
    duration?: number,
  ) => void;
  dismissNotification: (id: string) => void;
}
