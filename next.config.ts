import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/site.html",
        },
      ],
    };
  },
};

export default nextConfig;
