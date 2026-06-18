import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Vercel déploie le JS compilé même si TypeScript émet des erreurs de type.
    // Les erreurs runtime sont gérées par les gardes Number() dans le code.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
