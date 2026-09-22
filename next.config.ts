import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 纯静态导出：可直接托管到 Vercel / GitHub Pages / 任意静态服务器
  output: 'export',
  // 上级目录存在其他 lockfile 时，显式指定工程根，避免 Next 推断错工作区
  outputFileTracingRoot: path.resolve(process.cwd()),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    dirs: ['src', 'scripts'],
  },
};

export default nextConfig;
