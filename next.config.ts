import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',            // ⬅️ static export
  images: { unoptimized: true } // next/image प्रयोग भए
};

export default nextConfig;
