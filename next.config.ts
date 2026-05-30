import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  //skipWaiting: true,
});

const nextConfig: NextConfig = {
   // هذا السطر يخبر Next.js بتجاهل تعارضات Webpack
  images: {
    remotePatterns: [ // تحديث الإعدادات لتفادي تحذيرات الـ Deprecation
      {
        protocol: 'https',
        hostname: 'https://dimacardapp2.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {},
};

export default withPWA(nextConfig);