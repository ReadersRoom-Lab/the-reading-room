import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  outputFileTracingIncludes: {
    // Bundle the chrome-extension source files into the download API route
    '/api/extension/download': ['./chrome-extension/**/*'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
