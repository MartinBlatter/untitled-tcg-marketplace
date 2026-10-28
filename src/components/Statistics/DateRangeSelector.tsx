'use client';

import { FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DateRangeOption, DateRangeSelectorProps } from './types';

export default function DateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
    const t = useTranslations();
    const [rangeType, setRangeType] = useState<DateRangeOption>('30days');
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    const handleRangeTypeChange = (event: SelectChangeEvent) => {
        const value = event.target.value as DateRangeOption;
        setRangeType(value);

        const now = dayjs();
        let start: Dayjs | null = null;
        let end: Dayjs | null = now;

        switch (value) {
            case '7days':
                start = now.subtract(7, 'day');
                break;
            case '30days':
                start = now.subtract(30, 'day');
                break;
            case '90days':
                start = now.subtract(90, 'day');
                break;
            case '1year':
                start = now.subtract(1, 'year');
                break;
            case 'custom':
                start = startDate;
                end = endDate;
                break;
        }

        setStartDate(start);
        setEndDate(end);
        onDateRangeChange(start ? start.toDate() : null, end ? end.toDate() : null);
    };

    const handleStartDateChange = (date: Dayjs | null) => {
        setStartDate(date);
        if (rangeType === 'custom') {
            onDateRangeChange(date ? date.toDate() : null, endDate ? endDate.toDate() : null);
        }
    };

    const handleEndDateChange = (date: Dayjs | null) => {
        setEndDate(date);
        if (rangeType === 'custom') {
            onDateRangeChange(startDate ? startDate.toDate() : null, date ? date.toDate() : null);
        }
    };

    return (
        <Grid
            container
            spacing={2}
            sx={{
                alignItems: 'center',
                mb: 3
            }}>
            <Grid size={{ xs: 12 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id='date-range-select-label'>{t('statistics.dateRange.label')}</InputLabel>
                    <Select labelId='date-range-select-label' id='date-range-select' value={rangeType} label={t('statistics.dateRange.label')} onChange={handleRangeTypeChange}>
                        <MenuItem value='7days'>{t('statistics.dateRange.last7Days')}</MenuItem>
                        <MenuItem value='30days'>{t('statistics.dateRange.last30Days')}</MenuItem>
                        <MenuItem value='90days'>{t('statistics.dateRange.last90Days')}</MenuItem>
                        <MenuItem value='1year'>{t('statistics.dateRange.lastYear')}</MenuItem>
                        <MenuItem value='custom'>{t('statistics.dateRange.custom')}</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {rangeType === 'custom' && (
                <>
                    <Grid size={{ xs: 12 }}>
                        <DatePicker label={t('statistics.dateRange.startDate')} value={startDate} onChange={handleStartDateChange} slotProps={{ textField: { size: 'small' } }} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <DatePicker label={t('statistics.dateRange.endDate')} value={endDate} onChange={handleEndDateChange} slotProps={{ textField: { size: 'small' } }} />
                    </Grid>
                </>
            )}
        </Grid>
    );
}
