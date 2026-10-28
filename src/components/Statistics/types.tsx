import { SxProps, Theme } from '@mui/material';

export type DateRangeOption = '7days' | '30days' | '90days' | '1year' | 'custom';

export interface DateRangeSelectorProps {
    onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

export interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    sx?: SxProps<Theme>;
}

export type ChartType = 'bar' | 'line' | 'pie';

export interface StatsChartProps {
    title: string;
    data: any[];
    type?: ChartType;
    height?: number;
    yAxisLabel?: string;
    xAxisLabel?: string;
}
