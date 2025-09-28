/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'lodash', '@reduxjs/toolkit', 'react-redux', 'jspdf']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  output: 'standalone',
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size and build performance
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'lucide-react': 'lucide-react/dist/esm/icons'
      };

      // Enable more aggressive optimizations
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            }
          }
        }
      };
    }

    // Limit memory usage
    config.infrastructureLogging = { level: 'error' };

    return config;
  }
};

export default nextConfig;
