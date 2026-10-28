import { ENDPOINTS } from '../constants/endpoints';

export const uploadItemFileAction = async (name: string, file: File) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);

        fetch(ENDPOINTS.API.INVENTORY.ITEM_IMAGE, {
            method: 'POST',
            body: formData,
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
