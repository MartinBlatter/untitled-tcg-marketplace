'use client';

import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Box } from '@mui/material';
import { isEmpty } from 'ramda';
import ToastNotification from './single/ToastNotification';
import { ToastNotificationsProps } from './types';

const ToastNotifications = ({ stacked = true }: ToastNotificationsProps): React.ReactElement | null => {
    const { notifications } = useNotifications();

    if (isEmpty(notifications)) return null;

    return (
        <Box sx={{ px: 2 }}>
            {notifications.map((notification, index: number) => (
                <ToastNotification key={`toast-${notification.id}`} notification={notification} bottomOffset={!stacked ? (index + 1) * 60 : 20} />
            ))}
        </Box>
    );
};

export default ToastNotifications;
