/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mymealpicker.s3.eu-central-1.amazonaws.com",
        port: "",
        pathname: "/*",
      },
      {
        protocol: "https",
        hostname: "mymealpicker.s3.amazonaws.com",
        port: "",
        pathname: "/*",
      },
    ],
  },
};

export default nextConfig;
