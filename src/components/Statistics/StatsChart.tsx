'use client';

import { Box, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';

export interface StatsChartProps {
    title: string;
    data: any[];
    type?: 'bar' | 'line' | 'pie';
    height?: number;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

export default function StatsChart({ title, data, type = 'bar', height = 300, yAxisLabel, xAxisLabel }: StatsChartProps) {
    const t = useTranslations();

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 2, height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant='subtitle1' sx={{
                    color: 'text.secondary'
                }}>
                    {t('statistics.noData')}
                </Typography>
            </Paper>
        );
    }

    // For monthly sales
    if (type === 'line' || type === 'bar') {
        if (data[0] && 'label' in data[0] && data[0].label === 'monthlySales') {
            // Make a safe copy of the data to manipulate
            const monthsData = { ...data[0] };
            const { label, ...monthValues } = monthsData;

            // Extract months and values
            const months = Object.keys(monthValues);
            const values = Object.values(monthValues).map((val) => (typeof val === 'string' ? parseFloat(val) : val));

            // Only render if we have data
            if (months.length === 0) {
                return (
                    <Paper sx={{ p: 2, height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant='subtitle1' sx={{
                            color: 'text.secondary'
                        }}>
                            {t('statistics.noData')}
                        </Typography>
                    </Paper>
                );
            }

            return (
                <Paper sx={{ p: 2 }}>
                    <Typography variant='h6' gutterBottom>
                        {title}
                    </Typography>
                    <Box sx={{ width: '100%', height: height, display: 'flex', justifyContent: 'center' }}>
                        {type === 'line' ? (
                            <LineChart
                                series={[
                                    {
                                        data: values as number[],
                                        label: yAxisLabel || 'Value',
                                    },
                                ]}
                                xAxis={[
                                    {
                                        scaleType: 'band',
                                        data: months,
                                        label: xAxisLabel || 'Month',
                                    },
                                ]}
                                height={height}
                                margin={{ top: 20, right: 30, left: 50, bottom: 30 }}
                            />
                        ) : (
                            <BarChart
                                series={[
                                    {
                                        data: values as number[],
                                        label: yAxisLabel || 'Value',
                                    },
                                ]}
                                xAxis={[
                                    {
                                        scaleType: 'band',
                                        data: months,
                                        label: xAxisLabel || 'Month',
                                    },
                                ]}
                                height={height}
                                margin={{ top: 20, right: 30, left: 50, bottom: 30 }}
                            />
                        )}
                    </Box>
                </Paper>
            );
        }
    }

    // For pie chart (top products)
    if (type === 'pie') {
        if (data[0] && 'label' in data[0] && data[0].label === 'topProducts') {
            // Make a safe copy of the data to manipulate
            const productsData = { ...data[0] };
            const { label, ...productValues } = productsData;

            const pieData = Object.entries(productValues).map(([name, value]) => ({
                id: name,
                value: typeof value === 'string' ? parseFloat(value) : Number(value),
                label: name,
            }));

            // Only render if we have data
            if (pieData.length === 0) {
                return (
                    <Paper sx={{ p: 2, height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant='subtitle1' sx={{
                            color: 'text.secondary'
                        }}>
                            {t('statistics.noData')}
                        </Typography>
                    </Paper>
                );
            }

            return (
                <Paper sx={{ p: 2 }}>
                    <Typography variant='h6' gutterBottom>
                        {title}
                    </Typography>
                    <Box sx={{ width: '100%', height: height, display: 'flex', justifyContent: 'center' }}>
                        <PieChart
                            series={[
                                {
                                    data: pieData,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30 },
                                },
                            ]}
                            height={height}
                            margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
                        />
                    </Box>
                </Paper>
            );
        }
    }

    // Fallback to error message if data format doesn't match expectations
    return (
        <Paper sx={{ p: 2, height: height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant='h6' gutterBottom>
                {title}
            </Typography>
            <Typography variant='subtitle1' sx={{
                color: 'text.secondary'
            }}>
                {t('statistics.incompatibleData')}
            </Typography>
            <Typography
                variant='caption'
                sx={{
                    color: 'text.secondary',
                    mt: 1
                }}>
                Data format: {JSON.stringify(data).substring(0, 100)}...
            </Typography>
        </Paper>
    );
}
