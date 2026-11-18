import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(appDir, "../..");

const nextConfig = {
  devIndicators: false,
  turbopack: {
    root: monorepoRoot,
  },
  transpilePackages: ["@asebili/database", "@asebili/i18n", "@repo/ui"],
};

export default nextConfig;
