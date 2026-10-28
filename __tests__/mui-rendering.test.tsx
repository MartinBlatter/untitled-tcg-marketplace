/**
 * Render coverage for the MUI pieces that have no other automated tests and
 * that the v6 -> v9 / MUI X v7 -> v9 upgrade changed:
 *
 * - x-charts: `highlightScope` keys were renamed (faded/highlighted ->
 *   fade/highlight). StatsChart previously had a `@ts-ignore` masking its
 *   chart imports, so breakage there was invisible until runtime.
 * - x-data-grid: `useGridApiRef()` is now typed as possibly-null, and the
 *   imperative `autosizeColumns` calls run from an effect.
 * - Grid: v7 renamed Grid2 -> Grid; this checks the `size` API still renders.
 * - The theme uses `cssVariables: true`, which v9 changed the handling of.
 */
import { Box, Grid, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import StatsChart from '@/src/components/Statistics/StatsChart';
import { darkTheme, lightTheme } from '@/src/theme/theme';

jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

const rows = [
    { id: 1, name: 'Lightning Bolt', qty: 2 },
    { id: 2, name: 'Counterspell', qty: 1 },
];
const columns = [
    { field: 'name', headerName: 'Name' },
    { field: 'qty', headerName: 'Qty' },
];

// StatsChart keys off data[0].label: 'monthlySales' for bar/line charts and
// 'topProducts' for pie, with the remaining keys as the data points.
const seriesData = [{ label: 'monthlySales', Jan: 10, Feb: 20, Mar: 15 }];
const pieData = [{ label: 'topProducts', 'Lightning Bolt': 5, Counterspell: 3 }];

function GridApiRefHarness() {
    const apiRef = useGridApiRef();
    React.useEffect(() => {
        apiRef.current?.autosizeColumns({ columns: ['name'], includeHeaders: true, expand: true });
    }, [apiRef]);
    return <DataGrid apiRef={apiRef} rows={rows} columns={columns} autosizeOnMount disableRowSelectionOnClick />;
}

describe('MUI rendering', () => {
    test.each(['bar', 'line', 'pie'] as const)('StatsChart renders an svg for type=%s', (type) => {
        const data = type === 'pie' ? pieData : seriesData;
        const { container } = render(<StatsChart title={`chart-${type}`} data={data} type={type} />);

        expect(screen.getByText(`chart-${type}`)).toBeInTheDocument();
        // These are StatsChart's own fallbacks; hitting one means the chart
        // never rendered and the assertion below would pass vacuously.
        expect(screen.queryByText('statistics.incompatibleData')).toBeNull();
        expect(screen.queryByText('statistics.noData')).toBeNull();
        expect(container.querySelector('svg')).not.toBeNull();
    });

    test('DataGrid renders rows and autosizeColumns via apiRef does not throw', async () => {
        render(<GridApiRefHarness />);

        // autosizeColumns runs from an effect and updates grid state, so settle
        // those updates inside act() rather than leaving them to warn.
        await waitFor(() => {
            expect(screen.getByText('Lightning Bolt')).toBeInTheDocument();
        });
        expect(screen.getByText('Counterspell')).toBeInTheDocument();
    });

    test.each([
        ['light', lightTheme],
        ['dark', darkTheme],
    ] as const)('Grid size API and %s theme render', (_name, theme) => {
        const { container } = render(
            <ThemeProvider theme={theme}>
                <Grid container spacing={2} sx={{ marginTop: 1 }}>
                    <Grid size={{ xs: 12, md: 4.5 }}>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                            <Typography sx={{ color: 'text.secondary' }}>cell</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </ThemeProvider>,
        );

        expect(screen.getByText('cell')).toBeInTheDocument();
        expect(container.querySelector('.MuiGrid-root')).not.toBeNull();
    });
});
