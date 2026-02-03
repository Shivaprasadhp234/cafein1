import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nxqpbuglqpzylezgoqpl.supabase.co',
      },
    ],
  },
};

export default nextConfig;
