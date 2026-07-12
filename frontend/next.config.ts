import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const apiHost = new URL(apiUrl).host;
const apiProtocol = new URL(apiUrl).protocol.slice(0, -1);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol as "http" | "https",
        hostname: apiHost,
        pathname: "/storage/**",
      },
      {
        protocol: apiProtocol as "http" | "https",
        hostname: apiHost.replace("localhost", "127.0.0.1"),
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api-gm-consulting.okjtech.co.ke",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "gm-consulting.okjtech.co.ke",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api.gm-coaching.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "gm-coaching.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.transparenttextures.com",
      },
    ],
  },
};

export default nextConfig;
