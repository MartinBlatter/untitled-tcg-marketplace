import { ENDPOINTS } from '../constants/endpoints';

export type SetType = {
    code: string;
    name: string;
};

export async function fetchSets(): Promise<SetType[]> {
    try {
        const response = await fetch(ENDPOINTS.API.MAGIC.SETS);

        if (!response.ok) {
            throw new Error(`Failed to fetch sets: ${response.status}`);
        }

        const data = await response.json();
        return data.sets as SetType[];
    } catch (error) {
        console.error('Error fetching sets:', error);
        return [];
    }
}
