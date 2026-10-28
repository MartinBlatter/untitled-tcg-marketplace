import ImageWithFallback from '@/src/components/ImageWithFallback/ImageWithFallback';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { formatCurrency } from '@/src/utils/helpers';
import { BrokenImage, Brush, Gesture, GMobiledata, Star } from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    List,
    ListItem,
    ListItemText,
    Radio,
    RadioGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

interface AddToInventoryDialogProps {
    open: boolean;
    onClose: () => void;
    orderItems: any[];
    onSubmit: (selected: { id: number; listed: boolean }[]) => void;
}

export const AddToInventoryDialog = ({ open, onClose, orderItems, onSubmit }: AddToInventoryDialogProps) => {
    const t = useTranslations();
    const [selectedItems, setSelectedItems] = React.useState<{ [id: number]: boolean }>({});
    const [listedState, setListedState] = React.useState<'listed' | 'unlisted' | 'custom'>('listed');
    const [customListed, setCustomListed] = React.useState<{ [id: number]: boolean }>({});

    React.useEffect(() => {
        // Select all by default
        const initial: { [id: number]: boolean } = {};
        orderItems.forEach((item) => {
            initial[item.id] = true;
        });
        setSelectedItems(initial);
        setCustomListed(orderItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}));
        setListedState('listed');
    }, [orderItems, open]);

    const handleSelect = (id: number) => {
        setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleListedChange = (value: 'listed' | 'unlisted' | 'custom') => {
        setListedState(value);
        if (value !== 'custom') {
            setCustomListed(orderItems.reduce((acc, item) => ({ ...acc, [item.id]: value === 'listed' }), {}));
        }
    };

    const handleCustomListed = (id: number, value: boolean) => {
        setCustomListed((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        const selected = orderItems.filter((item) => selectedItems[item.id]).map((item) => ({ id: item.id, listed: listedState === 'custom' ? customListed[item.id] : listedState === 'listed' }));
        onSubmit(selected);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>{t('checkout.singleOrder.addToInventory')}</DialogTitle>
            <DialogContent>
                <Typography variant='subtitle1' sx={{ mb: 2 }}>
                    {t('checkout.singleOrder.selectItemsToAdd')}
                </Typography>
                <FormGroup>
                    <List>
                        {orderItems.map((item) => (
                            <ListItem key={item.id} dense>
                                <FormControlLabel
                                    control={<Checkbox checked={!!selectedItems[item.id]} onChange={() => handleSelect(item.id)} />}
                                    label={
                                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                                            <ListItemText primary={`${item.quantity} x ${item.displayName} ${formatCurrency(item.price)}`} />
                                            <Box sx={{ display: 'flex', mt: 0.5 }}>
                                                {item.card?.setCode && (
                                                    <Tooltip title={item.card?.setName || item.card?.setCode}>
                                                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                                            <ImageWithFallback
                                                                height={16}
                                                                width={16}
                                                                className='invertFilter'
                                                                src={`${INTERNAL_ROUTES.STATIC.IMAGES.MAGIC.EDITIONS}/${item.card.setCode.toLowerCase()}.svg`}
                                                                fallbackSrc={`${INTERNAL_ROUTES.STATIC.IMAGES.MAGIC.EDITIONS}/default.svg`}
                                                                alt={item.card.setCode}
                                                            />
                                                        </Box>
                                                    </Tooltip>
                                                )}
                                                {item.originalItem?.quality && (
                                                    <Typography variant='body2' component='span' sx={{ mr: 1 }}>
                                                        {item.originalItem.quality}
                                                    </Typography>
                                                )}
                                                {item.originalItem?.isFoil === 1 && (
                                                    <Tooltip title={t('inventory.inventoryColumns.foil')}>
                                                        <Star fontSize='small' sx={{ mr: 0.5 }} />
                                                    </Tooltip>
                                                )}
                                                {item.originalItem?.isAltered === 1 && (
                                                    <Tooltip title={t('inventory.inventoryColumns.altered')}>
                                                        <Brush fontSize='small' sx={{ mr: 0.5 }} />
                                                    </Tooltip>
                                                )}
                                                {item.originalItem?.isSigned === 1 && (
                                                    <Tooltip title={t('inventory.inventoryColumns.signed')}>
                                                        <Gesture fontSize='small' sx={{ mr: 0.5 }} />
                                                    </Tooltip>
                                                )}
                                                {item.originalItem?.isMisprint === 1 && (
                                                    <Tooltip title={t('inventory.inventoryColumns.misprint')}>
                                                        <BrokenImage fontSize='small' sx={{ mr: 0.5 }} />
                                                    </Tooltip>
                                                )}
                                                {item.originalItem?.isGraded === 1 && (
                                                    <Tooltip title={`${item.originalItem.gradingCompany || ''} ${item.originalItem.grading || ''}`}>
                                                        <GMobiledata fontSize='small' sx={{ mr: 0.5 }} />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </Box>
                                    }
                                />
                                {listedState === 'custom' && (
                                    <FormControlLabel
                                        control={<Checkbox checked={!!customListed[item.id]} onChange={(_, checked) => handleCustomListed(item.id, checked)} />}
                                        label={t('checkout.singleOrder.listed')}
                                        sx={{
                                            position: 'absolute',
                                            right: '16px',
                                            marginLeft: 0,
                                            transform: 'translateY(-50%)',
                                            top: '50%',
                                        }}
                                    />
                                )}
                            </ListItem>
                        ))}
                    </List>
                </FormGroup>
                <Typography variant='subtitle2' sx={{ mt: 2 }}>
                    {t('checkout.singleOrder.addAs')}
                </Typography>
                <RadioGroup row value={listedState} onChange={(e) => handleListedChange(e.target.value as any)}>
                    <FormControlLabel value='listed' control={<Radio />} label={t('checkout.singleOrder.listed')} />
                    <FormControlLabel value='unlisted' control={<Radio />} label={t('checkout.singleOrder.unlisted')} />
                    <FormControlLabel value='custom' control={<Radio />} label={t('checkout.singleOrder.custom')} />
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleSubmit} variant='contained'>
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddToInventoryDialog;
