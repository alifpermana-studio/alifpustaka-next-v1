import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* turbopack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/turbopack"],
    });
    return config;
  },*/

  reactStrictMode: true,
  reactCompiler: true,
  images: {
    localPatterns: [
      {
        pathname: "/api/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alifpustaka.web.id",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
        search: "?v=4",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],

    qualities: [25, 50, 75],
  },
};

export default nextConfig;
