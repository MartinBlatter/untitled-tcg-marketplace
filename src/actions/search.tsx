import { DetailedSearchParams } from '@/app/magic/search/types';
import { ENDPOINTS } from '../constants/endpoints';

export const searchForCardByNameAndSet = (currentLocale: string, name: string, setCodes: string) => {
    return new Promise((resolve, reject) => {
        let sets = [];

        if (setCodes !== '') {
            const setCodesArray = setCodes.split(',');

            for (let i = 0; i < setCodesArray.length; i++) {
                sets.push({ code: setCodesArray[i], name: '' });
            }
        }

        const values: DetailedSearchParams = {
            name: name || '',
            sets: sets,
            text: '',
            types: [],
            subtypes: [],
            colors: [],
            manaCost: '',
            rarity: [],
            priceMin: 0,
            priceMax: 0,
            artist: '',
            flavorText: '',
            formats: [],
            formatsLogic: '',
            keywords: [],
            loyalty: '',
            power: '',
            toughness: '',
            manaValue: '',
            loyaltyLogic: '',
            powerLogic: '',
            toughnessLogic: '',
            manaValueLogic: '',
            page: 1,
            pageSize: 10,
            sortBy: 'name',
            sortOrder: 'asc',
            locale: currentLocale,
        };

        fetch(ENDPOINTS.API.MAGIC.CARDS.SEARCH, {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.cards?.length > 0) {
                    resolve(data.cards[0]);
                } else {
                    resolve(null);
                }
            });
    });
};

export const searchForCardByUuid = (currentLocale: string, uuid: string) => {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINTS.API.MAGIC.CARDS.SINGLE}/?uuid=${uuid}&locale=${currentLocale}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    data = data[0];
                }

                if (data) {
                    if (data.error) reject(data.error);
                    resolve(data);
                }
            });
    });
};

export const searchForCardByScryfallId = (currentLocale: string, scryfallId: string) => {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINTS.API.MAGIC.CARDS.SINGLE}/?scryfallId=${scryfallId}&locale=${currentLocale}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    data = data[0];
                }

                if (data) {
                    if (data.error) reject(data.error);
                    resolve(data);
                }
            });
    });
};
