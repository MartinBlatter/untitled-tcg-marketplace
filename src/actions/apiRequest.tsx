export const apiRequest = async (url: string, method = 'GET', body?: { [key: string]: any }) => {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: method,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    // Always the whole body, error responses included: all 96 call
                    // sites branch on `data.success` / `data.error`, and resolving
                    // with the bare `data.error` value handed them `true`, which
                    // then read as a successful response with every field missing.
                    resolve(data);
                } else {
                    reject();
                }
            })
            // Without this a network failure or a non-JSON response (an HTML error
            // page, say) left the promise pending for ever, so callers never ran
            // their `.catch` and stayed stuck on `loading: true`.
            .catch(reject);
    });
};
