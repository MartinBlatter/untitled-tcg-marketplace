'use client';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationContext } from './context';
import { Notification } from './types';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    const addNotification = (notification: Notification) => {
        setNotifications((prevNotifications) => [...prevNotifications, notification]);
    };

    const addSuccessNotification = (message?: string) => {
        if (!message) return;

        addNotification({
            id: uuidv4(),
            message,
            severity: 'success',
            title: '',
        });
    };

    const addErrorNotification = (message?: string) => {
        if (!message) return;

        addNotification({
            id: uuidv4(),
            message,
            severity: 'error',
            title: '',
        });
    };

    const addWarningNotification = (message?: string) => {
        if (!message) return;

        addNotification({
            id: uuidv4(),
            message,
            severity: 'warning',
            title: '',
        });
    };

    const removeNotification = (id: string) => {
        setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
    };

    const resetNotifications = () => {
        setNotifications([]); // Reset the notifications array
    };

    const providerValue = {
        notifications,
        addNotification,
        addSuccessNotification,
        addErrorNotification,
        removeNotification,
        resetNotifications,
        addWarningNotification,
    };

    return <NotificationContext.Provider value={providerValue}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = React.useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
