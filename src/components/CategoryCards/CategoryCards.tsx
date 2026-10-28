import { Card, CardMedia, CardContent, Typography, Link, CardActionArea } from "@mui/material";
import { ProductsCardsProps, Category } from "./types";
import { useTranslations } from "next-intl";


const CategoryCards = ({ categories, set = '' }: ProductsCardsProps) => {
    const t = useTranslations();
    const setUrlPart = set ? `/${set}` : '';

    return (
        <>
            {
                categories.map((category: Category) => (
                    <Card key={category.id} sx={{ width: 264 }}>
                        <Link href={`${category.user ? `/user/${category.user}/inventory` : ''}/magic${setUrlPart}/${category.user ? '' : 'products/'}${category.name}`}>
                            <CardActionArea>
                                <CardMedia sx={{ height: 400, width: 264, backgroundSize: 'contain' }}
                                    image={`/images/${category.imageUrl}`}
                                    title={t(`products.categories.${category.name}`)}
                                />
                                <CardContent>
                                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                                        {t(`products.categories.${category.name}`)}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Link>
                    </Card>
                ))
            }
        </>
    )
};

export default CategoryCards;