import { ENDPOINTS } from '../constants/endpoints';

export function submitSendMessageAction(values: { title: string; message: string }, userId: number) {
    return new Promise((resolve, reject) => {
        if (!userId) reject();

        fetch(ENDPOINTS.API.MESSAGES.SEND, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId, title: values.title, message: values.message }),
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
}

export function getConversationsAction(page: number, size: number) {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINTS.API.MESSAGES.CONVERSATIONS}?page=${page}&size=${size}`)
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
