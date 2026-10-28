import { useSalesStore } from '@/src/store/sales';
import SalesFilters from '../SalesFilters/SalesFilters';

const NotArrivedSalesFilters = () => {
    const { notArrivedFilters, setNotArrivedFilters, resetNotArrivedFilters, notArrivedLoading } = useSalesStore();
    return <SalesFilters filters={notArrivedFilters} setFilters={setNotArrivedFilters} resetFilters={resetNotArrivedFilters} loading={notArrivedLoading} />;
};

export default NotArrivedSalesFilters;
