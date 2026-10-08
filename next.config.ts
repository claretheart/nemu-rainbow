import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // 親フォルダの package-lock.json をルートと取り違える警告を消す
  turbopack: { root: __dirname },
};

export default nextConfig;
