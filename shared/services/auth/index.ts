import { ILogin } from '@features/auth/components/login/interface';
import axiosInstance from '@shared/axios';
import { addAuthToStorage } from '@shared/utils/cookies-utils/cookies.util';

export const loginUser: any = async ({
    username,
    password,
    rememberMe,
    clientId,
    clientSecret,
    grantType,
}: ILogin) => {
    try {
        const response = await axiosInstance.post('/consultant/login', {
            username: username.trim(),
            password,
            clientId,
            clientSecret,
            grantType
        });
        if (response.status === 200) {
            await addAuthToStorage(response?.data, rememberMe);
            return [response, null];
        } else {
            return [null, null];
        }
    } catch (err: any) {
        if (err.status === 401)
            console.log('401')
        if (err.status === 500)
            console.log('500')
        return [null, err];
    }
};
