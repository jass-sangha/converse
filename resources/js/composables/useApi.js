import axios from 'axios';

let instance = null;

export function useApi() {
    if (instance) {
        return instance;
    }

    const config = window.RiwaaqConfig ?? {};

    instance = axios.create({
        baseURL: config.apiBaseUrl ?? '/api/chat',
        withCredentials: true,
        withXSRFToken: true,
        headers: {
            Accept: 'application/json',
        },
    });

    return instance;
}
