export interface SingleCardWishlistDialogProps {
    show: boolean;
    setShow: (state: boolean) => void;
    card: any;
    wishlistId: number;
    wishlistItem: any;
}
