'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import DateRangeSelector from '@/src/components/Statistics/DateRangeSelector';
import StatCard from '@/src/components/Statistics/StatCard';
import StatsChart from '@/src/components/Statistics/StatsChart';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { AttachMoney, BarChart, ShoppingCart } from '@mui/icons-material';
import { Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function SalesStatisticsPage() {
    const t = useTranslations();
    const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for sales data
    const [salesData, setSalesData] = useState({
        totalSales: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        monthlySales: [],
        topProducts: [],
    });

    // Function to fetch sales statistics from the API
    const fetchSalesStatistics = async (start: Date | null, end: Date | null) => {
        setLoading(true);
        setError(null);

        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (start) params.append('startDate', start.toISOString());
            if (end) params.append('endDate', end.toISOString());

            // Fetch data from API
            const response = await fetch(`${ENDPOINTS.API.STATISTICS.SALES}?${params.toString()}`);
            let data;

            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                throw new Error('Failed to parse response data');
            }

            if (!response.ok || !data.success) {
                throw new Error(data?.message || 'Failed to fetch sales statistics');
            }

            // Update state with real data
            setSalesData({
                totalSales: data.totalSales || 0,
                totalRevenue: data.totalRevenue || 0,
                avgOrderValue: data.avgOrderValue || 0,
                monthlySales: Array.isArray(data.monthlySales) ? data.monthlySales : [],
                topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
            });
        } catch (err) {
            console.error('Error fetching sales statistics:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');

            // Reset to default empty values on error
            setSalesData({
                totalSales: 0,
                totalRevenue: 0,
                avgOrderValue: 0,
                monthlySales: [],
                topProducts: [],
            });
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount and when date range changes
    useEffect(() => {
        fetchSalesStatistics(startDate, endDate);
    }, [startDate, endDate]);

    const handleDateRangeChange = (start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
    };

    // Render loading state
    if (loading && !salesData.monthlySales.length) {
        return (
            <Container maxWidth='lg' sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Render error state
    if (error) {
        return (
            <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
                <Typography color='error' variant='h6'>
                    Error: {error}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
            <BasicBreadcrumbs current={t('statistics.salesTitle')} />

            <Box sx={{ mb: 4 }}>
                <Typography variant='h4' component='h1' sx={{ textAlign: 'center' }}>
                    {t('statistics.salesTitle')}
                </Typography>
                <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title={t('statistics.totalSales')} value={salesData.totalSales} icon={<ShoppingCart />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title={t('statistics.totalRevenue')} value={`€${salesData.totalRevenue.toFixed(2)}`} icon={<AttachMoney />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title={t('statistics.metrics.avgOrderValue')} value={`€${salesData.avgOrderValue.toFixed(2)}`} icon={<BarChart />} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <StatsChart title={t('statistics.monthlySales')} data={salesData.monthlySales} type='line' xAxisLabel='month' yAxisLabel='revenue' />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <StatsChart title={t('statistics.topSellingProducts')} data={salesData.topProducts} type='pie' />
                </Grid>
            </Grid>
        </Container>
    );
}
