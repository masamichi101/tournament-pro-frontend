/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // ← 必要に応じて増やす（例：5MB）
    },
  },
}

module.exports = nextConfig