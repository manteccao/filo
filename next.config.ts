import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Only use static export for Capacitor builds (CAPACITOR_BUILD=1 npm run build)
  // Vercel runs as a normal Next.js app with server components
  ...(process.env.CAPACITOR_BUILD === "1" ? { output: "export" } : {}),
  // Rewrites are not supported in static export mode (Capacitor builds)
  ...(process.env.CAPACITOR_BUILD !== "1"
    ? {
        async rewrites() {
          return [{ source: "/", destination: "/landing/index.html" }];
        },
      }
    : {}),
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  experimental: {
    // Tree-shake these packages to only import what is actually used
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default nextConfig;
