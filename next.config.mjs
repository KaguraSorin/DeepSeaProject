/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 构建时不做 ESLint 阻塞，交由 `npm run lint` 单独检查（比赛要求：构建优先）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;