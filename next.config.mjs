
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  webpack: (config, { isServer }) => {
    // Fix for canvas binary in pdfjs-dist
    config.resolve.alias.canvas = false;
    
    // Ignore .node files (native binaries)
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Externalize canvas for server-side
    if (isServer) {
      config.externals.push('canvas');
    }

    return config;
  },
};

export default nextConfig;
