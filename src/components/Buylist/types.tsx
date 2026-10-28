import { Buylist } from '@/src/store/types';

export interface BuylistAddDialogProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

export interface BuylistEditDialogProps {
    show: boolean;
    setShow: (show: boolean) => void;
    buylist: Buylist;
}

export interface BuylistTileProps {
    buylist: Buylist;
}

export interface EditBuylistDialogProps {
    show: boolean;
    setShow: (show: boolean) => void;
    buylist: Buylist;
}
