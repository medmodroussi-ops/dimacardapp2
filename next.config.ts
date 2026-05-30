import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  //skipWaiting: true,
});

const nextConfig: NextConfig = {
  turbopack: {}, // هذا السطر يخبر Next.js بتجاهل تعارضات Webpack
  images: {
    remotePatterns: [ // تحديث الإعدادات لتفادي تحذيرات الـ Deprecation
      {
        protocol: 'https',
        hostname: 'oacgwabzxojphecskyex.supabase.co',
      },
    ],
  },
};

export default withPWA(nextConfig);