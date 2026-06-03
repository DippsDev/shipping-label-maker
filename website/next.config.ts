import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // On Vercel the build runs from the git root via `npm --prefix website run build`,
  // so we need .next/ to land in the root where Vercel expects it.
  distDir: process.env.VERCEL ? '../.next' : '.next',
  serverExternalPackages: ['@napi-rs/canvas', 'bwip-js', 'tesseract.js', 'sharp', '@zxing/library', 'zxing-wasm'],
};

export default nextConfig;
