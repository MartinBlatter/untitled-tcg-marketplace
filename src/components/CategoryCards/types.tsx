export interface ProductsCardsProps {
    categories: Category[];
    set?: string;
}


export interface Category {
    id: string;
    name: string;
    imageUrl: string;
    user?: string
}