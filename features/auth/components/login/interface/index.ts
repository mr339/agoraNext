export interface ILogin {
    username: string;
    password: string;
    rememberMe: boolean;
    clientId: string;
    clientSecret: string;
    grantType: string;
}
