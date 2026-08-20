/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'phimimg.com' },
      { protocol: 'https', hostname: 'phimapi.com' },
      { protocol: 'https', hostname: '**.phimimg.com' },
    ],
  },
};

export default nextConfig;
