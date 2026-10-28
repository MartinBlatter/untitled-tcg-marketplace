import CloseIcon from '@mui/icons-material/Close';
import { Alert, Box, Button, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { CSSProperties } from 'react';
import { AlertMessageProps } from './types';

const iconSize: CSSProperties = {
    width: 20,
    height: 20,
};

const AlertMessage = ({ notification, type = 'inline', onClick, onActionClick }: AlertMessageProps) => {
    const t = useTranslations();

    const isInline = type === 'inline';

    if (!notification) return;

    return (
        <Alert
            severity={notification.severity}
            icon={notification.icon}
            onClose={onClick}
            slots={{ closeIcon: CloseIcon }}
            action={
                notification.action && (
                    <Box sx={{
                        gap: '0.2rem'
                    }}>
                        <Button size='small' onClick={onActionClick} variant='outlined' color={notification.severity}></Button>
                        {!isInline && (
                            <IconButton onClick={onClick} color='inherit'>
                                <CloseIcon sx={iconSize} />
                            </IconButton>
                        )}
                    </Box>
                )
            }
        >
            {notification.message}
        </Alert>
    );
};

export default AlertMessage;
