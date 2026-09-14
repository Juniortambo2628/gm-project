import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const apiHost = new URL(apiUrl).host;
const apiProtocol = new URL(apiUrl).protocol.slice(0, -1);

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' js.stripe.com assets.calendly.com js.calendly.com www.googletagmanager.com www.google-analytics.com vercel.live",
            "frame-src 'self' checkout.stripe.com calendly.com *.calendly.com",
            "style-src 'self' 'unsafe-inline' assets.calendly.com fonts.googleapis.com",
            "img-src 'self' data: blob: images.unsplash.com *.stripe.com *.calendly.com www.transparenttextures.com api.gm-coaching.com gm-coaching.com",
            "font-src 'self' fonts.gstatic.com",
            "connect-src 'self' api.gm-coaching.com *.stripe.com",
          ].join("; "),
        },
      ],
    },
  ],
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
        hostname: "api.gm-coaching.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "www.api.gm-coaching.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "gm-coaching.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "www.gm-coaching.com",
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
