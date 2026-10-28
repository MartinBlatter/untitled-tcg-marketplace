import Carousel from '@/src/components/Carousel/Carousel';
import CategoryCards from '@/src/components/CategoryCards/CategoryCards';
import { magicCategories } from '@/src/constants/categories';
import { Grid } from '@mui/material';

export default function Home() {
    return (
        <>
            <Carousel />
            <Grid container spacing={4} style={{ marginTop: '520px' }}>
                <CategoryCards categories={magicCategories} />
            </Grid>
        </>
    );
}
