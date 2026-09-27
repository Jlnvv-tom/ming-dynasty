import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * 部署前缀。
 * GitHub Pages 的「项目站」地址为 https://<user>.github.io/<repo>/，
 * 静态导出的 /_next 资源与站内链接若不带前缀会全部 404，因此必须设置 basePath。
 * 若改为根路径部署（自定义域名，或 <user>.github.io 用户站），构建时传 BASE_PATH= 即可。
 */
const BASE_PATH = process.env.BASE_PATH ?? '/ming-dynasty';

const nextConfig: NextConfig = {
  // 纯静态导出
  output: 'export',
  // 上级目录存在其他 lockfile 时，显式指定工程根，避免 Next 推断错工作区
  outputFileTracingRoot: path.resolve(process.cwd()),
  trailingSlash: true,
  basePath: BASE_PATH || undefined,
  assetPrefix: BASE_PATH ? `${BASE_PATH}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    dirs: ['src', 'scripts'],
  },
};

export default nextConfig;
