import React from 'react';

export interface ConfirmationDialogProps {
    response: () => void;
    title: string;
    description: string | React.ReactNode;
    children: (showDialog: () => void) => React.ReactNode;
}
