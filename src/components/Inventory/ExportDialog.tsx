'use client';

import { useInventoryStore } from '@/src/store/inventory';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ExportDialogProps {
    open: boolean;
    onClose: () => void;
    currentTab: number; // 0: all, 1: private, 2: for sale
}

const ExportDialog = ({ open, onClose, currentTab }: ExportDialogProps) => {
    const t = useTranslations();
    const [scope, setScope] = useState<string>('all');
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    // Get the current filters from the inventory store
    const { filters } = useInventoryStore();

    const handleExport = async () => {
        setLoading(true);
        try {
            // Generate timestamp for the filename
            const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
            const filename = `inventory_export_${timestamp}.csv`;

            // Build the export URL with query parameters
            const params = new URLSearchParams();
            params.append('scope', scope);
            params.append('filter', filter);
            params.append('filename', filename);

            // Add current filters to params if 'current' filter is selected
            if (filter === 'current' && filters) {
                // Convert filters object to JSON string and append it
                params.append('filters', JSON.stringify(filters));
            }

            // Use window.location to trigger the file download
            window.location.href = `/api/inventory/export?${params.toString()}`;
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            // Add a small delay before closing to prevent race conditions
            setTimeout(() => {
                setLoading(false);
                onClose();
            }, 1000);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
            <DialogTitle>{t('inventory.export.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>{t('inventory.export.description')}</DialogContentText>

                <FormControl component='fieldset' sx={{ mt: 2 }}>
                    <FormLabel component='legend'>{t('inventory.export.scopeLabel')}</FormLabel>
                    <RadioGroup value={scope} onChange={(e) => setScope(e.target.value)}>
                        <FormControlLabel value='all' control={<Radio />} label={t('inventory.export.scopeAll')} />
                        <FormControlLabel value='listed' control={<Radio />} label={t('inventory.export.scopeListed')} />
                        <FormControlLabel value='unlisted' control={<Radio />} label={t('inventory.export.scopeUnlisted')} />
                    </RadioGroup>
                </FormControl>

                <FormControl component='fieldset' sx={{ mt: 3 }}>
                    <FormLabel component='legend'>{t('inventory.export.filterLabel')}</FormLabel>
                    <RadioGroup value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <FormControlLabel value='all' control={<Radio />} label={t('inventory.export.filterAll')} />
                        <FormControlLabel value='current' control={<Radio />} label={t('inventory.export.filterCurrent')} />
                    </RadioGroup>
                </FormControl>

                <DialogContentText sx={{ mt: 2 }}>{t('inventory.export.notice')}</DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    {t('cancel')}
                </Button>
                <Button onClick={handleExport} variant='contained' color='primary' disabled={loading}>
                    {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                            {t('inventory.export.exporting')}
                        </Box>
                    ) : (
                        t('inventory.export.startExport')
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportDialog;
