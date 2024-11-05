/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'api.dicebear.com'],
  },
  headers() {
    return [
      {
        source: '/static/*', // cache static assets
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        source: '/api/*', // cache API responses
        headers: [
          { key: 'Cache-Control', value: 'max-age=3600, must-revalidate' },
        ],
      },
      {
        source: '/(.*)', // cache all other routes
        headers: [
          { key: 'Cache-Control', value: 'max-age=3600, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
