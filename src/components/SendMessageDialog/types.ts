export interface SendMessageDialogProps {
    open: boolean;
    handleClose: () => void;
    userName: string;
    userId: number;
}