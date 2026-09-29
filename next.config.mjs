/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 静态导出（Cloudflare Pages）通过 `npm run build:cf` 触发，构建脚本会设置 NEXT_OUTPUT=export
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  eslint: {
    // 构建时不做 ESLint 阻塞，交由 `npm run lint` 单独检查（比赛要求：构建优先）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;