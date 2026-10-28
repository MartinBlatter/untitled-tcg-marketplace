import { usePurchasesStore } from '@/src/store/purchases';
import PurchaseFilters from '../PurchaseFilters/PurchaseFilters';

const CancelledPurchasesFilters = () => {
    const { cancelledFilters, setCancelledFilters, resetCancelledFilters, cancelledLoading } = usePurchasesStore();
    return <PurchaseFilters filters={cancelledFilters} setFilters={setCancelledFilters} resetFilters={resetCancelledFilters} loading={cancelledLoading} />;
};

export default CancelledPurchasesFilters;
