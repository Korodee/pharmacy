const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for PDFKit font file loading in Next.js
      // PDFKit uses __dirname + '/data/Helvetica.afm' which doesn't work in Next.js builds
      // We need to copy the font files to the build output or use a plugin
      const CopyWebpackPlugin = require('copy-webpack-plugin');
      
      // Copy PDFKit font files to the build output so PDFKit can find them
      if (!config.plugins) {
        config.plugins = [];
      }
      
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data'),
              to: path.join(process.cwd(), '.next', 'server', 'vendor-chunks', 'data'),
              noErrorOnMissing: true,
            },
          ],
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
