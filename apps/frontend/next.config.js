/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;
