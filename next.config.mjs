
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Disable static generation for problematic routes during build
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
