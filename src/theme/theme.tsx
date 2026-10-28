'use client';
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
    palette: {
        contrastThreshold: 4.5,
        primary: {
            main: '#22A699',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#F29727',
            contrastText: '#FFFFFF',
        },
    },
});

export const darkTheme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
    palette: {
        mode: 'dark',
        contrastThreshold: 4.5,
        primary: {
            main: '#00FFFF',
            contrastText: '#3F3F3F',
        },
        secondary: {
            main: '#4169E1',
        },
    },
});
