import { ENDPOINTS } from '../constants/endpoints';

export async function getCardsAction(currentLocale: string, searchTerm: string, size: number, page: number, params: any, sortBy: string, sortOrder: string, filters: any) {
    return new Promise((resolve, reject) => {
        fetch(
            `${ENDPOINTS.API.MAGIC.CARDS.LIST}/${currentLocale}/${encodeURI(searchTerm)}?size=${size}&page=${page}${
                params.set ? `&set=${params.set}` : ''
            }&sortBy=${sortBy}&sortOrder=${sortOrder}&${Object.keys(filters)
                .map((key) => `filter${key}=${(filters as any)[key]}`)
                .join('&')}`
        )
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    if (data.error) reject(data.error);
                    resolve(data);
                } else {
                    reject();
                }
            });
    });
}
