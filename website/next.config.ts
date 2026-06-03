import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@napi-rs/canvas', 'bwip-js', 'tesseract.js', 'sharp', '@zxing/library', 'zxing-wasm'],
};

export default nextConfig;
