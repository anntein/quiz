/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/quiz',
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  }
}

module.exports = nextConfig 