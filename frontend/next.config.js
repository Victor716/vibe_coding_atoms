/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 决策：不引入 Next proxy，前端直连 FastAPI（CORS 由后端处理），
  // 保留 rewrites 位置以便未来生产环境加反代时启用。
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
