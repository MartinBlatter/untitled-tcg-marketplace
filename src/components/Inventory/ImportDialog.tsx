import { CloudUpload, FileDownload } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    LinearProgress,
    Radio,
    RadioGroup,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import CustomTabPanel from '../CustomTabPanel/CustomTabPanel';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

interface ImportResult {
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    errors?: Array<{
        row: number;
        reason: string;
        data?: Record<string, any>;
    }>;
    processingTime?: string;
    potentialMatchesAvailable?: boolean;
    potentialMatchesCsv?: string;
}

export default function ImportDialog({ open, onClose, onImportComplete }: ImportDialogProps) {
    const t = useTranslations();
    const [file, setFile] = useState<File | null>(null);
    const [manaboxFile, setManaboxFile] = useState<File | null>(null);
    const [internalFormatFile, setInternalFormatFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingManabox, setIsDraggingManabox] = useState(false);
    const [isDraggingInternalFormat, setIsDraggingInternalFormat] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importingPotentialMatches, setImportingPotentialMatches] = useState(false);
    const [listingOption, setListingOption] = useState<string>('listed');
    const [potentialMatchesListingOption, setPotentialMatchesListingOption] = useState<string>('listed');
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [potentialMatchesImportResult, setPotentialMatchesImportResult] = useState<ImportResult | null>(null);
    const [recordCount, setRecordCount] = useState<number>(0);
    const [manaboxRecordCount, setManaboxRecordCount] = useState<number>(0);
    const [internalFormatRecordCount, setInternalFormatRecordCount] = useState<number>(0);
    const [currentTab, setCurrentTab] = useState(0);
    const [moxfieldText, setMoxfieldText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const manaboxFileInputRef = useRef<HTMLInputElement>(null);
    const internalFormatFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
                setImportResult(null);
                // Estimate number of records (approximate count)
                estimateRecordCount(droppedFile, setRecordCount);
            } else {
                setImportResult({
                    success: false,
                    message: t('inventory.import.invalidFileType'),
                    imported: 0,
                    failed: 1,
                });
            }
        }
    };

    const handleManaboxFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingManabox(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setManaboxFile(droppedFile);
                setImportResult(null);
                // Estimate number of records (approximate count)
                estimateRecordCount(droppedFile, setManaboxRecordCount);
            } else {
                setImportResult({
                    success: false,
                    message: t('inventory.import.invalidFileType'),
                    imported: 0,
                    failed: 1,
                });
            }
        }
    };

    const handleInternalFormatFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingInternalFormat(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setInternalFormatFile(droppedFile);
                setImportResult(null);
                // Estimate number of records (approximate count)
                estimateRecordCount(droppedFile, setInternalFormatRecordCount);
            } else {
                setImportResult({
                    success: false,
                    message: t('inventory.import.invalidFileType'),
                    imported: 0,
                    failed: 1,
                });
            }
        }
    };

    const estimateRecordCount = async (file: File, setCount: React.Dispatch<React.SetStateAction<number>>) => {
        try {
            const text = await file.text();
            // Rough estimate by counting newlines
            const lineCount = text.split('\n').length - 1; // -1 for header
            setCount(lineCount);
        } catch (error) {
            console.error('Error estimating record count:', error);
            setCount(0);
        }
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setImportResult(null);
                // Estimate number of records
                estimateRecordCount(selectedFile, setRecordCount);
            } else {
                setImportResult({
                    success: false,
                    message: t('inventory.import.invalidFileType'),
                    imported: 0,
                    failed: 1,
                });
            }
        }
    };

    const handleManaboxFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.csv')) {
                setManaboxFile(selectedFile);
                setImportResult(null);
                // Estimate number of records
                estimateRecordCount(selectedFile, setManaboxRecordCount);
            } else {
                setImportResult({
                    success: false,
                    message: t('inventory.import.invalidFileType'),
                    imported: 0,
                    failed: 1,
                });
            }
        }
    };

    const handleInternalFormatFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.csv')) {
                setInternalFormatFile(selectedFile);
                setImportResult(null);
                // Estimate number of records
                estimateRecordCount(selectedFile, setInternalFormatRecordCount);
            } else {
                setImportResult({
                    success: false,
                    message: t('inventory.import.invalidFileType'),
                    imported: 0,
                    failed: 1,
                });
            }
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleManaboxBrowseClick = () => {
        manaboxFileInputRef.current?.click();
    };

    const handleInternalFormatBrowseClick = () => {
        internalFormatFileInputRef.current?.click();
    };

    const handleImport = async () => {
        if (currentTab === 0 && !file) return;
        if (currentTab === 1 && !moxfieldText.trim()) {
            setImportResult({
                success: false,
                message: t('inventory.import.noDataEntered', { type: 'Moxfield' }),
                imported: 0,
                failed: 1,
            });
            return;
        }
        if (currentTab === 2 && !manaboxFile) {
            setImportResult({
                success: false,
                message: t('inventory.import.noFileSelected', { type: 'ManaBox' }),
                imported: 0,
                failed: 1,
            });
            return;
        }
        if (currentTab === 3 && !internalFormatFile) {
            setImportResult({
                success: false,
                message: t('inventory.import.noFileSelected', { type: 'Internal Format' }),
                imported: 0,
                failed: 1,
            });
            return;
        }

        setImporting(true);
        setImportResult(null);

        try {
            let response;

            if (currentTab === 0) {
                // TCG Powertools CSV file upload
                const formData = new FormData();
                formData.append('file', file!);
                formData.append('listingOption', listingOption);

                response = await fetch('/api/inventory/import', {
                    method: 'POST',
                    body: formData,
                });
            } else if (currentTab === 1) {
                // Moxfield text import
                response = await fetch('/api/inventory/import/moxfield', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: moxfieldText,
                        listingOption: listingOption,
                    }),
                });
            } else if (currentTab === 2) {
                // ManaBox CSV file upload
                const formData = new FormData();
                formData.append('file', manaboxFile!);
                formData.append('listingOption', listingOption);

                response = await fetch('/api/inventory/import/manabox', {
                    method: 'POST',
                    body: formData,
                });
            } else {
                // Internal Format CSV file upload (tab 3) or fallback
                const formData = new FormData();
                formData.append('file', internalFormatFile!);
                formData.append('listingOption', listingOption);

                response = await fetch('/api/inventory/import/internal-format', {
                    method: 'POST',
                    body: formData,
                });
            }

            const result = await response.json();
            setImportResult(result);

            if (result.success) {
                setTimeout(() => {
                    onImportComplete();
                }, 2000);
            }
        } catch (error) {
            setImportResult({
                success: false,
                message: t('inventory.import.serverError'),
                imported: 0,
                failed: 0,
            });
        } finally {
            setImporting(false);
        }
    };

    const handleImportPotentialMatches = async () => {
        if (!importResult?.potentialMatchesCsv) return;

        setImportingPotentialMatches(true);
        setPotentialMatchesImportResult(null);

        try {
            const formData = new FormData();
            formData.append('file', new Blob([importResult.potentialMatchesCsv], { type: 'text/csv' }));
            formData.append('listingOption', potentialMatchesListingOption);

            const response = await fetch('/api/inventory/import/internal-format', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setPotentialMatchesImportResult(result);

            if (result.success) {
                setTimeout(() => {
                    onImportComplete();
                }, 2000);
            }
        } catch (error) {
            setPotentialMatchesImportResult({
                success: false,
                message: t('inventory.import.serverError'),
                imported: 0,
                failed: 0,
            });
        } finally {
            setImportingPotentialMatches(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setManaboxFile(null);
        setInternalFormatFile(null);
        setImportResult(null);
        setPotentialMatchesImportResult(null);
        setRecordCount(0);
        setManaboxRecordCount(0);
        setInternalFormatRecordCount(0);
        setMoxfieldText('');
        onClose();
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        setImportResult(null);
    };

    // Calculate file size in MB
    const fileSizeInMB = file ? (file.size / (1024 * 1024)).toFixed(2) : '0';
    const manaboxFileSizeInMB = manaboxFile ? (manaboxFile.size / (1024 * 1024)).toFixed(2) : '0';
    const internalFormatFileSizeInMB = internalFormatFile ? (internalFormatFile.size / (1024 * 1024)).toFixed(2) : '0';

    // Get appropriate title based on the current tab
    const getDialogTitle = () => {
        switch (currentTab) {
            case 0:
                return t('inventory.import.title');
            case 1:
                return t('inventory.import.titleMoxfield');
            case 2:
                return t('inventory.import.titleManaBox');
            case 3:
                return t('inventory.import.titleInternalFormat');
            default:
                return t('inventory.import.title');
        }
    };

    // Function to download failed imports as CSV
    const downloadFailedImports = () => {
        if (!importResult || !importResult.errors || importResult.errors.length === 0) return;

        // Create CSV header with reason column first
        let csvContent = 'reason,';

        // Add headers from the first error's data if available
        if (importResult.errors[0].data) {
            const headers = Object.keys(importResult.errors[0].data);
            csvContent += headers.join(',') + '\n';
        } else {
            csvContent += 'row\n'; // Default fallback if no data structure is available
        }

        // Add each error row
        importResult.errors.forEach((error) => {
            // Add the error reason as the first column
            csvContent += `"${error.reason.replace(/"/g, '""')}",`;

            // Add the original data if available
            if (error.data) {
                const values = Object.values(error.data);
                const formattedValues = values.map((value) => {
                    if (typeof value === 'string') {
                        // Escape quotes and wrap in quotes
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                csvContent += formattedValues.join(',') + '\n';
            } else {
                csvContent += `${error.row}\n`; // Just add the row number if no data
            }
        });

        // Create file and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
        link.href = url;
        link.setAttribute('download', `failed_imports_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to download potential matches as CSV
    const downloadPotentialMatches = () => {
        if (!importResult || !importResult.potentialMatchesCsv) return;

        const blob = new Blob([importResult.potentialMatchesCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
        link.href = url;
        link.setAttribute('download', `potential_matches_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onClose={importing ? undefined : handleClose} maxWidth='md' fullWidth>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogContent>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label='Import options'>
                    <Tab label='TCG Powertools' />
                    <Tab label='Moxfield' />
                    <Tab label='ManaBox' />
                    <Tab label='Internal Format' />
                </Tabs>

                <Box sx={{ mt: 3, mb: 2 }}>
                    <FormControl component='fieldset'>
                        <Typography variant='subtitle2' gutterBottom>
                            {t('inventory.import.listingOption')}
                        </Typography>
                        <RadioGroup name='listingOption' value={listingOption} onChange={(e) => setListingOption(e.target.value)} row>
                            <FormControlLabel value='listed' control={<Radio />} label={t('inventory.import.optionListed')} />
                            <FormControlLabel value='unlisted' control={<Radio />} label={t('inventory.import.optionUnlisted')} />
                        </RadioGroup>
                    </FormControl>
                </Box>

                <CustomTabPanel value={currentTab} index={0}>
                    <Typography variant='body1' gutterBottom>
                        {t('inventory.import.description')}
                    </Typography>

                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: isDragging ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: isDragging ? 'action.hover' : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={handleBrowseClick}
                    >
                        <input type='file' ref={fileInputRef} onChange={handleFileInputChange} style={{ display: 'none' }} accept='.csv' />
                        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant='h6'>{file ? file.name : t('inventory.import.dropzoneText')}</Typography>
                        <Typography variant='body2' color='textSecondary'>
                            {t('inventory.import.dropzoneSubtext')}
                        </Typography>
                        {file && (
                            <Box sx={{
                                mt: 1
                            }}>
                                <Typography variant='body2'>{`${fileSizeInMB} MB - ${recordCount} ${t('inventory.import.estimatedRecords')}`}</Typography>
                            </Box>
                        )}
                    </Box>
                </CustomTabPanel>

                <CustomTabPanel value={currentTab} index={1}>
                    <Typography variant='body1' gutterBottom>
                        {t('inventory.import.descriptionMoxfield')}
                    </Typography>

                    <Typography variant='body2' color='textSecondary' gutterBottom sx={{ mt: 2 }}>
                        {t('inventory.import.formatMoxfield')}
                    </Typography>

                    <TextField
                        label={t('inventory.import.moxfieldExportLabel')}
                        multiline
                        rows={10}
                        value={moxfieldText}
                        onChange={(e) => setMoxfieldText(e.target.value)}
                        placeholder={t('inventory.import.moxfieldExportPlaceholder')}
                        fullWidth
                        variant='outlined'
                        sx={{ mt: 2 }}
                    />
                </CustomTabPanel>

                <CustomTabPanel value={currentTab} index={2}>
                    <Typography variant='body1' gutterBottom>
                        {t('inventory.import.descriptionManaBox')}
                    </Typography>

                    <Typography variant='body2' color='textSecondary' gutterBottom sx={{ mt: 2 }}>
                        {t('inventory.import.formatManaBox')}
                    </Typography>

                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: isDraggingManabox ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: isDraggingManabox ? 'action.hover' : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingManabox(true);
                        }}
                        onDragLeave={() => setIsDraggingManabox(false)}
                        onDrop={handleManaboxFileDrop}
                        onClick={handleManaboxBrowseClick}
                    >
                        <input type='file' ref={manaboxFileInputRef} onChange={handleManaboxFileInputChange} style={{ display: 'none' }} accept='.csv' />
                        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant='h6'>{manaboxFile ? manaboxFile.name : t('inventory.import.dropzoneText')}</Typography>
                        <Typography variant='body2' color='textSecondary'>
                            {t('inventory.import.dropzoneSubtext')}
                        </Typography>
                        {manaboxFile && (
                            <Box sx={{
                                mt: 1
                            }}>
                                <Typography variant='body2'>{`${manaboxFileSizeInMB} MB - ${manaboxRecordCount} ${t('inventory.import.estimatedRecords')}`}</Typography>
                            </Box>
                        )}
                    </Box>
                </CustomTabPanel>

                <CustomTabPanel value={currentTab} index={3}>
                    <Typography variant='body1' gutterBottom>
                        {t('inventory.import.descriptionInternalFormat')}
                    </Typography>

                    <Typography variant='body2' color='textSecondary' gutterBottom sx={{ mt: 2 }}>
                        {t('inventory.import.formatInternalFormat')}
                    </Typography>

                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: isDraggingInternalFormat ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: isDraggingInternalFormat ? 'action.hover' : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingInternalFormat(true);
                        }}
                        onDragLeave={() => setIsDraggingInternalFormat(false)}
                        onDrop={handleInternalFormatFileDrop}
                        onClick={handleInternalFormatBrowseClick}
                    >
                        <input type='file' ref={internalFormatFileInputRef} onChange={handleInternalFormatFileInputChange} style={{ display: 'none' }} accept='.csv' />
                        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant='h6'>{internalFormatFile ? internalFormatFile.name : t('inventory.import.dropzoneText')}</Typography>
                        <Typography variant='body2' color='textSecondary'>
                            {t('inventory.import.dropzoneSubtext')}
                        </Typography>
                        {internalFormatFile && (
                            <Box sx={{
                                mt: 1
                            }}>
                                <Typography variant='body2'>{`${internalFormatFileSizeInMB} MB - ${internalFormatRecordCount} ${t('inventory.import.estimatedRecords')}`}</Typography>
                            </Box>
                        )}
                    </Box>
                </CustomTabPanel>

                {importing && (
                    <Box sx={{
                        mt: 3
                    }}>
                        <Typography variant='body2' sx={{
                            mb: 1
                        }}>
                            {t('inventory.import.processingFile')}
                        </Typography>
                        <LinearProgress />
                    </Box>
                )}

                {importResult && (
                    <Box sx={{
                        mt: 3
                    }}>
                        <Alert severity={importResult.success ? 'success' : 'error'}>
                            <Typography variant='subtitle1'>{importResult.message}</Typography>
                            {importResult.success && (
                                <>
                                    <Typography variant='body2'>{t('inventory.import.importedCount', { count: importResult.imported })}</Typography>
                                    {importResult.processingTime && <Typography variant='body2'>{t('inventory.import.processingTime', { time: importResult.processingTime })}</Typography>}
                                </>
                            )}
                            {importResult.failed > 0 && <Typography variant='body2'>{t('inventory.import.failedCount', { count: importResult.failed })}</Typography>}

                            {/* Download buttons */}
                            <Box
                                sx={{
                                    mt: 1,
                                    display: 'flex',
                                    gap: 2
                                }}>
                                {importResult.failed > 0 && importResult.errors && importResult.errors.length > 0 && (
                                    <Button variant='outlined' color='primary' startIcon={<FileDownload />} onClick={downloadFailedImports} size='small'>
                                        {t('inventory.import.downloadFailedRows')}
                                    </Button>
                                )}
                                {importResult.potentialMatchesAvailable && importResult.potentialMatchesCsv && (
                                    <Button variant='outlined' color='primary' startIcon={<FileDownload />} onClick={downloadPotentialMatches} size='small'>
                                        {t('inventory.import.downloadPotentialMatches')}
                                    </Button>
                                )}
                            </Box>
                        </Alert>

                        {importResult.errors && importResult.errors.length > 0 && (
                            <Box
                                sx={{
                                    mt: 2,
                                    maxHeight: 200,
                                    overflow: 'auto'
                                }}>
                                <Typography variant='subtitle2' gutterBottom>
                                    {t('inventory.import.errorDetails')}:
                                </Typography>
                                {importResult.errors.slice(0, 100).map((error, index) => (
                                    <Typography key={index} variant='body2' color='error' gutterBottom>
                                        {t('inventory.import.errorRow', { row: error.row })}: {error.reason}
                                    </Typography>
                                ))}
                                {importResult.errors.length > 100 && (
                                    <Typography variant='body2' color='textSecondary'>
                                        {t('inventory.import.andMoreErrors', { count: importResult.errors.length - 100 })}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                )}

                {importResult?.potentialMatchesAvailable && (
                    <Box sx={{
                        mt: 3
                    }}>
                        <Divider />
                        <Typography variant='h6' sx={{
                            mt: 2
                        }}>
                            {t('inventory.import.potentialMatchesTitle')}
                        </Typography>
                        <Box sx={{ mt: 3, mb: 2 }}>
                            <FormControl component='fieldset'>
                                <Typography variant='subtitle2' gutterBottom>
                                    {t('inventory.import.listingOption')}
                                </Typography>
                                <RadioGroup name='potentialMatchesListingOption' value={potentialMatchesListingOption} onChange={(e) => setPotentialMatchesListingOption(e.target.value)} row>
                                    <FormControlLabel value='listed' control={<Radio />} label={t('inventory.import.optionListed')} />
                                    <FormControlLabel value='unlisted' control={<Radio />} label={t('inventory.import.optionUnlisted')} />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Button
                            onClick={handleImportPotentialMatches}
                            color='primary'
                            variant='contained'
                            disabled={importingPotentialMatches}
                            startIcon={importingPotentialMatches ? <CircularProgress size={20} /> : undefined}
                        >
                            {importingPotentialMatches ? t('inventory.import.importing') : t('inventory.import.startImportPotentialMatches')}
                        </Button>
                        {potentialMatchesImportResult && (
                            <Box sx={{
                                mt: 3
                            }}>
                                <Alert severity={potentialMatchesImportResult.success ? 'success' : 'error'}>
                                    <Typography variant='subtitle1'>{potentialMatchesImportResult.message}</Typography>
                                    {potentialMatchesImportResult.success && (
                                        <>
                                            <Typography variant='body2'>{t('inventory.import.importedCount', { count: potentialMatchesImportResult.imported })}</Typography>
                                            {potentialMatchesImportResult.processingTime && (
                                                <Typography variant='body2'>{t('inventory.import.processingTime', { time: potentialMatchesImportResult.processingTime })}</Typography>
                                            )}
                                        </>
                                    )}
                                    {potentialMatchesImportResult.failed > 0 && (
                                        <Typography variant='body2'>{t('inventory.import.failedCount', { count: potentialMatchesImportResult.failed })}</Typography>
                                    )}
                                </Alert>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={importing}>
                    {importResult?.success ? t('close') : t('cancel')}
                </Button>
                <Button
                    onClick={handleImport}
                    color='primary'
                    variant='contained'
                    disabled={(currentTab === 0 && !file) || (currentTab === 1 && !moxfieldText.trim()) || (currentTab === 2 && !manaboxFile) || (currentTab === 3 && !internalFormatFile) || importing}
                    startIcon={importing ? <CircularProgress size={20} /> : undefined}
                >
                    {importing ? t('inventory.import.importing') : t('inventory.import.startImport')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
