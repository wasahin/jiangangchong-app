/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['172.30.240.237'],
  output: 'export',
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
