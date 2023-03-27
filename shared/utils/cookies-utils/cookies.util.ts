import { deleteCookie, getCookie, setCookie } from 'cookies-next';

import { CookieKeys } from '@shared/enum';

export const getUserFromStorage = (): any => {
    let user = getCookie(CookieKeys.USER);
    return user;
};

export const addAuthToStorage = (token: any, rememberMe: boolean) => {
    if (rememberMe) {
        setCookie(CookieKeys.USER, token.data.accessToken, { maxAge: 86400 });
    } else {
        setCookie(CookieKeys.USER, token.data.accessToken, { maxAge: 86400 });
    }
};

export const getToken = () => {
    if (getUserFromStorage()) {
        const token = getUserFromStorage();
        return token;
    }
};

export const clearAuthFromStorage = () => {
    deleteCookie(CookieKeys.USER);
};
