import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Box, Slide, SlideProps, Snackbar } from '@mui/material';
import { isNil } from 'ramda';
import AlertMessage from '../../AlertMessage/AlertMessage';
import { ToastNotificationProps } from '../types';

const slideTransition = (props: SlideProps): React.ReactElement => <Slide {...props} direction='up' />;

const ToastNotification = ({ notification, bottomOffset }: ToastNotificationProps) => {
    const { removeNotification } = useNotifications();

    const handleClose = () => {
        if (!isNil(notification.id)) removeNotification(notification.id);
    };

    const handleActionClick = () => {
        notification.action && notification.action();
        removeNotification(notification.id);
    };

    return (
        <Snackbar
            open
            key={`alert-${notification.id}`}
            autoHideDuration={6000}
            slots={{ transition: slideTransition }}
            sx={{
                paddingX: 1,
                bottom: bottomOffset,
                zIndex: 9999,
            }}
        >
            <Box sx={{ width: '100%' }}>
                <AlertMessage type='toast' notification={notification} onClick={handleClose} onActionClick={handleActionClick} />
            </Box>
        </Snackbar>
    );
};

export default ToastNotification;
