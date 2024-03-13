const nextConfig = {
  reactStrictMode: true,


  images: {
    unoptimized: true,
  },

  

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

module.exports = nextConfig;

