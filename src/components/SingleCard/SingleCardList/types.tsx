import { SingleCard } from "../SingleCardTiles/types";

export interface SingleCardListProps {
    cards: SingleCard[];
    loading: boolean;
    sortBy?: string;
    sortOrder?: string;
    setSortBy: (sortBy: string) => void;
}