import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle for the Render Node service.
  output: "standalone",
  // Without this, Next detects the monorepo root from the parent package.json
  // and nests the output at .next/standalone/web/server.js, which breaks the
  // deploy start command. Pinning it to this directory keeps it at
  // .next/standalone/server.js.
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
