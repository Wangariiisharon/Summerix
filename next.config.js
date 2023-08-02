/** @type {import('next').NextConfig} */
<<<<<<< HEAD
const nextConfig = {}
=======
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/signin/',
        permanent: true,
      },
    ];
  },
}
>>>>>>> origin/develop

module.exports = nextConfig
