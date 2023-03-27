import { getToken } from '@shared/utils/cookies-utils/cookies.util';
import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const axiosInstance = axios.create({
    baseURL: publicRuntimeConfig.baseURL,
    headers: {
        Accept: 'application/json',
        'Authorization': `Bearer ${getToken()}`,
    },
});

axiosInstance.interceptors.response.use(
    (response: any) => {
        return response;
    },
    async (error) => {
        const originalConfig = error.config;
        if (error.message === 'Network Error') {
            return new Error('Network Error');
        }

        if (error.response.status === 306 && !originalConfig._retry) {
            return axiosInstance;
        }

        if (error.response.data.code == 1006) {
            if (!originalConfig._retry) {
                originalConfig._retry = true;
                try {
                    await axiosInstance.post('/refresh', {}, { withCredentials: true });
                    return axiosInstance(originalConfig);
                } catch (error: any) {
                    if (error.response && error.response.data) {
                        if (window.location.pathname !== '/login') {
                            window.localStorage.setItem(
                                'sessionmessage',
                                JSON.stringify({
                                    message: 'Your session has expired!',
                                    type: 'error',
                                })
                            );
                            history.pushState(null, '', '/login');
                        }
                        return Promise.reject(error);
                    }
                }
            }
            return {
                ...originalConfig,
                cancelToken: new axios.CancelToken((cancel) =>
                    cancel('Cancel repeated request')
                ),
            };
        }

        return Promise.reject({
            ...error,
            response: error.response,
            message: error?.message,
            status: error.response.status,
        });
    }
);

export default axiosInstance;

