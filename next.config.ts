import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 全ページ静的なので、書き出した out/ をそのまま Cloudflare Pages に置く
  output: "export",
  images: { unoptimized: true },
  // 親フォルダの package-lock.json をルートと取り違える警告を消す
  turbopack: { root: __dirname },
};

export default nextConfig;
