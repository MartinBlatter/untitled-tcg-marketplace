import { Notification } from '../../lib/context/NotificationProvider/types';

export type AlertMessageProps = {
    notification: Notification;
    namespace?: string;
    type?: 'inline' | 'toast';
    onClick?: () => void;
    onActionClick?: () => void;
}