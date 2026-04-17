import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for Capacitor builds (CAPACITOR_BUILD=1 npm run build)
  // Vercel runs as a normal Next.js app with server components
  ...(process.env.CAPACITOR_BUILD === "1" ? { output: "export" } : {}),
};

export default nextConfig;
