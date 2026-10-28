import { formatsEnum, formatsLogicEnum } from "@/src/constants/formats";

export interface DetailedSearchParams {
    name?: string;
    text?: string;
    types?: string[];
    subtypes?: string[];
    colors?: string[];
    manaCost?: string;
    sets?: string[] | { code: string; name: string }[];
    rarity?: string[];
    priceMin?: number;
    priceMax?: number;
    artist?: string;
    flavorText?: string;
    formats?: Format[];
    formatsLogic?: string;
    keywords?: string[];
    loyalty?: string;
    power?: string;
    toughness?: string;
    manaValue?: string;
    loyaltyLogic?: string;
    powerLogic?: string;
    toughnessLogic?: string;
    manaValueLogic?: string;
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: string;
    locale?: string;
}

export interface Format {
    name: typeof formatsEnum;
    logic: typeof formatsLogicEnum;
}
