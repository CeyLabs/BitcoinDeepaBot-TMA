/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["*.sats.day"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
