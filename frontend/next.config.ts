import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['3000.dev.ericksantana.dev.br'],
};

export default nextConfig;
