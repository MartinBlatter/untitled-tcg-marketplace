import { ENDPOINTS } from '../constants/endpoints';

export async function uploadProfileFileAction(file: any, type: string) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('type', type);
    return new Promise((resolve, reject) => {
        fetch(ENDPOINTS.API.PROFILE.UPLOAD, { method: 'POST', body: formData })
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
