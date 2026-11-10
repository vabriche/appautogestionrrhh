import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Solo para `next dev` detrás de Caddy (https://autogestion.local); el build no lo usa.
  allowedDevOrigins: ["autogestion.local"],
};

export default nextConfig;
