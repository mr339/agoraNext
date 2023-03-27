/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
const nextConfig = {
  sassOptions: {
    additionalData: `@use 'styles/sass/common' as *;`,
  },
  swcMinify: true,
  i18n,
  async headers() {
    return [
      {
        source: '/(.*)?', // Matches all pages
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(),fullscreen=self',
          },
          {
            key: 'Content-Security-Policy',
            value: `object-src 'none'; frame-ancestors 'none'`, //The object-src directive is set to 'none' to prevent plugins from being loaded.
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  publicRuntimeConfig: {
    baseURL: process.env.SYSTEM_BASE_URL,
    SOCKET_URL: process.env.SOCKET_URL,
    AGORA_APP_ID: process.env.AGORA_APP_ID,
    AGORA_APP_CERTIFICATE: process.env.AGORA_APP_CERTIFICATE,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    GRANT_TYPE: process.env.GRANT_TYPE,
  },
};

module.exports = nextConfig;
