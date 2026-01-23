import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "povxjsjilldnbbwafjvi.supabase.co", // <-- Podmień na SWÓJ adres z .env (bez https://)
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  transpilePackages: ["lucide-react"],
  reactStrictMode: true,
};
export default nextConfig;
