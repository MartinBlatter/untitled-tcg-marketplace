'use client';

import { NotificationProvider } from "./NotificationProvider";

interface ClientProviderProps {
    children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProviderProps) {
    return (
        <NotificationProvider>
            {children}
        </NotificationProvider>
    );
}