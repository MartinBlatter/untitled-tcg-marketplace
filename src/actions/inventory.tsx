import { ENDPOINTS } from '../constants/endpoints';
import { FilterQueryParams, getQueryParts } from '../utils/helpers';

export const getInventoryAction = async (page: number, size: number, sortBy: string, sortOrder: string, filters: FilterQueryParams, listed?: number) => {
    return new Promise((resolve, reject) => {
        const queryParts = getQueryParts(filters);
        let url = `${ENDPOINTS.API.INVENTORY.LIST}?page=${page}&size=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}&${queryParts.join('&')}`;
        if (listed === 0 || listed === 1) url += `&listed=${listed}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    resolve(data);
                } else {
                    resolve(false);
                }
            });
    });
};

export const getPublicInventoryAction = async (user: string, page: number, size: number, sortBy: string, sortOrder: string, filters: FilterQueryParams) => {
    return new Promise((resolve, reject) => {
        const queryParts = getQueryParts(filters);
        fetch(`${ENDPOINTS.API.INVENTORY.PUBLIC}/${encodeURI(user as string)}?page=${page}&size=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}&${queryParts.join('&')}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    resolve(data);
                } else {
                    resolve(false);
                }
            });
    });
};

export const submitItemChangeAction = async (values: { price: number; quantity: number }, id: number, listed: boolean) => {
    return new Promise((resolve, reject) => {
        if (!id) reject();

        fetch(ENDPOINTS.API.INVENTORY.ITEM, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, price: values.price, quantity: values.quantity, isListed: listed ? true : false }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    resolve(data.success);
                } else {
                    resolve(false);
                }
            });
    });
};

export const submitItemAddAction = async (
    values: {
        price: number;
        quantity: number;
        language: string;
        quality: string;
        comment: string;
        internalComment: string;
        isFoil: boolean;
        isAltered: boolean;
        isSigned: boolean;
        dontList: boolean;
        isGraded: boolean;
        grading: string;
        gradingCompany: string;
    },
    id: string
) => {
    return new Promise((resolve, reject) => {
        if (!id) reject();

        fetch(ENDPOINTS.API.INVENTORY.ITEM_ADD, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, type: 'single', ...values }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    resolve(data.success);
                } else {
                    resolve(false);
                }
            });
    });
};
