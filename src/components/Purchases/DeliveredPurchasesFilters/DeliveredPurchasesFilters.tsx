import { usePurchasesStore } from '@/src/store/purchases';
import PurchaseFilters from '../PurchaseFilters/PurchaseFilters';

const DeliveredPurchasesFilters = () => {
    const { deliveredFilters, setDeliveredFilters, resetDeliveredFilters, deliveredLoading } = usePurchasesStore();
    return <PurchaseFilters filters={deliveredFilters} setFilters={setDeliveredFilters} resetFilters={resetDeliveredFilters} loading={deliveredLoading} />;
};

export default DeliveredPurchasesFilters;
