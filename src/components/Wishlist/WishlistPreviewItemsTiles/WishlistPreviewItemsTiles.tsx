import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { WishlistItem } from '@/src/store/types';
import { useWishlistsStore } from '@/src/store/wishlists';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Grid, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import SingleCardImage from '../../SingleCard/SingleCardImage/SingleCardImage';

export default function WishlistPreviewItemsTiles({ items, importErrors }: { items: WishlistItem[]; importErrors: string[] }) {
    const t = useTranslations();
    const theme = useTheme();
    const { setPreviewItems, addItem, refresh } = useWishlistsStore();
    const notifications = useNotifications();

    const handleImport = async (items: WishlistItem[]) => {
        for (const item of items) {
            await addItem(item).then((res: any) => {
                if (res.success) {
                    notifications.addSuccessNotification(t('wishlists.notifications.successAddSingleCard'));
                    refresh();
                } else {
                    notifications.addErrorNotification(t('wishlists.notifications.errorAddSingleCard'));
                }
            });
        }
        setPreviewItems([]);
    };

    return (
        <>
            <Typography variant='h5' sx={{ color: 'secondary.main', mt: 2, mb: 1 }}>
                {t('wishlists.single.preview')}
            </Typography>
            <Button
                variant='contained'
                color='secondary'
                onClick={() => {
                    handleImport(items);
                }}
            >
                {t('wishlists.single.savePreview')}
            </Button>
            <Button
                variant='outlined'
                color='secondary'
                sx={{ ml: 1 }}
                onClick={() => {
                    setPreviewItems([]);
                }}
            >
                {t('wishlists.single.dismissPreview')}
            </Button>
            {importErrors && importErrors.length > 0 && (
                <Alert severity='error' sx={{ mt: 2 }}>
                    {importErrors.map((error, index) => (
                        <Box key={`import-error-${index}`}>{error}</Box>
                    ))}
                </Alert>
            )}
            <Grid container spacing={4} sx={{ mt: 2, mb: 2, justifyContent: 'left' }}>
                {items.map((item: any, index: number) => (
                    <Card
                        sx={{
                            width: '264px',
                            boxShadow: `0px 0px 3px 5px ${theme.palette.secondary.main}`,
                        }}
                        key={`card-preview-item-${index}`}
                    >
                        <CardActionArea sx={{ height: '100%' }}>
                            <SingleCardImage card={item} showOverlay />
                            <CardContent>
                                <Typography variant='h6'>
                                    {item.quantity} x {item.name}
                                </Typography>
                                <Typography variant='body1'>
                                    {t('wishlists.single.maxPrice')} {item.price !== 0 ? `${item.price} €` : '-'}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Grid>
        </>
    );
}
function useTranslation() {
    throw new Error('Function not implemented.');
}
