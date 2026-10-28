export type NotificationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface Notification {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
    longMessage?: string;
    transOptions?: Record<string, string>;
    actionText?: string;
    icon?: React.ReactNode;
    action?: () => void;
}

export interface NotificationContextProps {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    addSuccessNotification: (message: string) => void;
    addErrorNotification: (message: string) => void;
    addWarningNotification: (message: string) => void;
    removeNotification: (id: string) => void;
    resetNotifications: () => void;
}