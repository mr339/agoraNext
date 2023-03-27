import { CookieKeys } from '../enum/index';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(CookieKeys.ACCESS_TOKEN);
};

export const clearLocalStorage = () => {
  localStorage.removeItem(CookieKeys.ACCESS_TOKEN);
  // localStorage.removeItem(CookieKeys.REFRESH_TOKEN);
};

export const addAuthToLocalStorage = (token: string, refreshToken: string) => {
  localStorage.setItem(CookieKeys.ACCESS_TOKEN, token);
  // localStorage.setItem(CookieKeys.REFRESH_TOKEN, refreshToken);
};

export const getCurrentTheme = () => {
  return localStorage.getItem('theme');
};
