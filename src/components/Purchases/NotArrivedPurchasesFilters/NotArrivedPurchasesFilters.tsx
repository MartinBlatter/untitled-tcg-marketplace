import { usePurchasesStore } from '@/src/store/purchases';
import PurchaseFilters from '../PurchaseFilters/PurchaseFilters';

const NotArrivedPurchasesFilters = () => {
    const { notArrivedFilters, setNotArrivedFilters, resetNotArrivedFilters, notArrivedLoading } = usePurchasesStore();
    return <PurchaseFilters filters={notArrivedFilters} setFilters={setNotArrivedFilters} resetFilters={resetNotArrivedFilters} loading={notArrivedLoading} />;
};

export default NotArrivedPurchasesFilters;
