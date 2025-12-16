/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverComponentsExternalPackages: [
            'puppeteer',
            'fluent-ffmpeg',
            '@ffmpeg-installer/ffmpeg',
            '@ffprobe-installer/ffprobe'
        ],
    },
};

export default nextConfig;
