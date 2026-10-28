export interface SingleCardTilesProps {
    cards: SingleCard[];
    loading?: boolean;
    setSortBy: (sortBy: string) => void;
    sortBy: string;
    sortOrder: string;
}


export interface SingleCard {
    id: number;
    uuid: string;
    name: string;
    set: string;
    setCode: string;
    rarity: string;
    price: number;
    imageUrl: string;
    foreignName: string;
    number: string;
}