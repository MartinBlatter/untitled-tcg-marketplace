import { SetType } from '@/src/actions/sets';

export interface SetAutocompleteProps {
    sets: string[] | SetType[];
    value: string | string[] | null;
    onChange: (value: string | string[] | null) => void;
    multiple?: boolean;
    label?: string;
    placeholder?: string;
    fullWidth?: boolean;
    required?: boolean;
    disabled?: boolean;
    size?: 'small' | 'medium';
    freeSolo?: boolean;
    noOptionsText?: string;
}