import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for Capacitor builds (CAPACITOR_BUILD=1 npm run build)
  // Vercel runs as a normal Next.js app with server components
  ...(process.env.CAPACITOR_BUILD === "1" ? { output: "export" } : {}),
  experimental: {
    // Tree-shake these packages to only import what is actually used
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default nextConfig;
