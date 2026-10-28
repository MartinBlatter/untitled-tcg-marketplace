import { Notification } from '../../lib/context/NotificationProvider/types';

export interface ToastNotificationProps {
    notification: Notification;
    bottomOffset?: number;
}

export interface ToastNotificationsProps {
    stacked?: boolean;
}