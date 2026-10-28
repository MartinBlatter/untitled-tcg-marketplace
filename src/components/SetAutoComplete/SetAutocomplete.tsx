import { prepareSetsForAutocomplete } from '@/src/utils/selectOptionBuilders.helper';
import { Autocomplete, Box, TextField } from '@mui/material';
import React from 'react';
import { SetAutocompleteProps } from './types';

export const SetAutocomplete: React.FC<SetAutocompleteProps> = ({
    sets,
    value,
    onChange,
    multiple = false,
    label = 'Set',
    placeholder = 'Select a set',
    fullWidth = true,
    required = false,
    disabled = false,
    size = 'medium',
    freeSolo = false,
    noOptionsText = 'No sets found',
}) => {
    const options = React.useMemo(() => prepareSetsForAutocomplete(sets), [sets]);

    // Convert the value to the format expected by Autocomplete
    const convertedValue = React.useMemo(() => {
        if (multiple && Array.isArray(value)) {
            return options.filter((option) => value.includes(option.code));
        } else if (!multiple && typeof value === 'string') {
            return options.find((option) => option.code === value) || null;
        }
        return multiple ? [] : null;
    }, [value, options, multiple]);

    const handleChange = (_event: any, newValue: any) => {
        if (multiple) {
            const codes = Array.isArray(newValue) ? newValue.map((item) => item.code) : [];
            onChange(codes);
        } else {
            const code = newValue ? newValue.code : null;
            onChange(code);
        }
    };

    return (
        <Autocomplete
            multiple={multiple}
            options={options}
            value={convertedValue}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
            onChange={handleChange}
            fullWidth={fullWidth}
            disabled={disabled}
            size={size}
            freeSolo={freeSolo}
            disableCloseOnSelect={multiple}
            renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} required={required} variant='outlined' />}
            renderOption={(props, option) => (
                <Box component='li' {...props} key={option.code}>
                    {option.label}
                </Box>
            )}
            noOptionsText={noOptionsText}
        />
    );
};

export default SetAutocomplete;
