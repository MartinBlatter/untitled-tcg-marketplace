import { useSalesStore } from '@/src/store/sales';
import SalesFilters from '../SalesFilters/SalesFilters';

const DeliveredSalesFilters = () => {
    const { deliveredFilters, setDeliveredFilters, resetDeliveredFilters, deliveredLoading } = useSalesStore();
    return <SalesFilters filters={deliveredFilters} setFilters={setDeliveredFilters} resetFilters={resetDeliveredFilters} loading={deliveredLoading} />;
};

export default DeliveredSalesFilters;
