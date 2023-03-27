export const config = {
    gateway: {
        baseURL: process.env.SYSTEM_BASE_URL,
        AGORA_APP_ID: process.env.AGORA_APP_ID,
        AGORA_APP_CERTIFICATE: process.env.AGORA_APP_CERTIFICATE,
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET,
        GRANT_TYPE: process.env.GRANT_TYPE
    },
};
