import { Box, MenuItem } from '@mui/material';
import Image from 'next/image';
import { ReactElement } from 'react';
import { cardTypesEnum } from '../constants/cardTypes';
import { raritiesEnum } from '../constants/rarities';
import { magicSetCodeToNameMapping } from '../lib/mappings/magicSetCodeToNameMapping';

export function buildCountrySelectOptions(countries: string[], t: any) {
    const countryChoices: ReactElement[] = [];

    countries.forEach((country) => {
        countryChoices.push(
            <MenuItem key={`country-${country}`} value={country}>
                <Box
                    component='img'
                    sx={{
                        height: 16,
                    }}
                    alt={t(`countries.${country.toUpperCase()}`)}
                    src={`/images/flags/${country.toLowerCase()}.gif`}
                />
                <Box sx={{ ml: 1, display: 'inline' }}>{t(`countries.${country}`)}</Box>
            </MenuItem>
        );
    });

    return countryChoices;
}

export function buildQualitySelectOptions(qualities: string[], t: any) {
    const qualityChoices: ReactElement[] = [];
    qualities.forEach((quality) => {
        qualityChoices.push(
            <MenuItem key={`quality-${quality}`} value={quality}>
                {t(`qualityStrings.${quality}`)}
            </MenuItem>
        );
    });

    return qualityChoices;
}

export function buildLanguageSelectOptions(languages: string[], t: any) {
    const languageChoices: ReactElement[] = [];
    languages.forEach((language) => {
        languageChoices.push(
            <MenuItem key={`language-${language}`} value={language}>
                <Image height={16} width={24} alt={t(`localeStrings.${language}`)} src={`/images/flags/${language}.gif`} />
                <Box sx={{ ml: 1, display: 'inline' }}>{t(`localeStrings.${language}`)}</Box>
            </MenuItem>
        );
    });

    return languageChoices;
}

// New function to prepare set data for Autocomplete component
export function prepareSetsForAutocomplete(magicSets: string[] | { code: string; name: string }[]) {
    // Check if the first item is a string or an object
    if (!magicSets.length) return [];

    if (typeof magicSets[0] === 'object' && 'code' in magicSets[0] && 'name' in magicSets[0]) {
        // Handle sets coming from the database with code and name properties
        return (magicSets as { code: string; name: string }[])
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
            .map((set) => ({
                code: set.code,
                name: set.name,
                label: `${set.name} (${set.code})`,
            }));
    } else {
        // Handle legacy string array of set codes
        return (magicSets as string[])
            .slice()
            .sort((a, b) => {
                const nameA = magicSetCodeToNameMapping[a as keyof typeof magicSetCodeToNameMapping];
                const nameB = magicSetCodeToNameMapping[b as keyof typeof magicSetCodeToNameMapping];
                return nameA.localeCompare(nameB, undefined, { numeric: true });
            })
            .map((set) => ({
                code: set,
                name: magicSetCodeToNameMapping[set as keyof typeof magicSetCodeToNameMapping] || set,
                label: `${magicSetCodeToNameMapping[set as keyof typeof magicSetCodeToNameMapping] || set} (${set})`,
            }));
    }
}

export function buildRaritySelectOptions(t: any) {
    const rarityChoices: ReactElement[] = [];
    raritiesEnum.forEach((rarity) => {
        rarityChoices.push(
            <MenuItem key={`rarity-${rarity}`} value={rarity}>
                {t(`rarities.${rarity}`)}
            </MenuItem>
        );
    });

    return rarityChoices;
}

export function buildTypeSelectOptions(t: any) {
    const typeChoices: ReactElement[] = [];
    cardTypesEnum.forEach((type) => {
        typeChoices.push(
            <MenuItem key={`type-${type}`} value={type}>
                {t(`cardTypes.${type}`)}
            </MenuItem>
        );
    });

    return typeChoices;
}
