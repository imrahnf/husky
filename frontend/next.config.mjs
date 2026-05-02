/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://husky.omrahnfaqiri.com/:path*",
      },
    ];
  },
};

export default nextConfig;
