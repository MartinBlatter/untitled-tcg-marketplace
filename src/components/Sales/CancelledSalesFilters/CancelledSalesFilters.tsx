import { useSalesStore } from '@/src/store/sales';
import SalesFilters from '../SalesFilters/SalesFilters';

const CancelledSalesFilters = () => {
    const { cancelledFilters, setCancelledFilters, resetCancelledFilters, cancelledLoading } = useSalesStore();
    return <SalesFilters filters={cancelledFilters} setFilters={setCancelledFilters} resetFilters={resetCancelledFilters} loading={cancelledLoading} />;
};

export default CancelledSalesFilters;
