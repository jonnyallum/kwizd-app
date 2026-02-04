/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true
    },
    // Ensure we don't try to optimize fonts that might need server
    optimizeFonts: false
};

export default nextConfig;
