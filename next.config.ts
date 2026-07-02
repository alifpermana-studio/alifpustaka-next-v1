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
};

export default nextConfig;
