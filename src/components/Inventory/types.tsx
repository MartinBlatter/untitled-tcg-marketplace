export interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

export interface ImportResult {
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    errors?: Array<{
        row: number;
        reason: string;
        data?: Record<string, any>;
    }>;
}
