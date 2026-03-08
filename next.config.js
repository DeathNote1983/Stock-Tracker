/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow external images from CoinGecko
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'assets.coingecko.com' },
        ],
    },
};

module.exports = nextConfig;
