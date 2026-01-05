/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // PWA support headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WALLET_SERVICE_URL: process.env.NEXT_PUBLIC_WALLET_SERVICE_URL || 'http://localhost:3002',
    NEXT_PUBLIC_BOOKING_SERVICE_URL: process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL || 'http://localhost:3003',
  },
};

module.exports = nextConfig;
