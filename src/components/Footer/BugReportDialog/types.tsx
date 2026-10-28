interface BugReport {
    category: string;
    title: string;
    description: string;
    email?: string;
}

interface BugReportDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}
