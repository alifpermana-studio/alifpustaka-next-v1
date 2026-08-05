import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  reactCompiler: true,
  allowedDevOrigins: ["alifpustaka.local"],
  images: {
    localPatterns: [
      {
        pathname: "/api/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.alifpustaka.web.id",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
    qualities: [25, 50, 75],
  },
};

export default nextConfig;
