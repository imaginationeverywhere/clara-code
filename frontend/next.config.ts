import path from 'path'
import type { NextConfig } from 'next'

// In CI, npm workspaces hoist `next` to the repo root node_modules/.
// Turbopack needs its root set to the repo root so it can resolve next/package.json.
// outputFileTracingRoot must match so Next.js doesn't flag a root mismatch.
const repoRoot = path.resolve(process.cwd(), '..')

const nextConfig: NextConfig = {
  // @cloudflare/next-on-pages compatibility
  // Note: edge runtime is set per-route via `export const runtime = 'edge'`
  // in layout.tsx / page.tsx, not here
  typescript: {
    // Type checking is handled by the CI workflow (npm run check / tsgo --noEmit)
    // Workspace-local packages (@mariozechner/*) are not resolvable by Vercel CLI in CI
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Point to repo root where npm workspaces hoists next/package.json in CI.
    root: repoRoot,
  },
  // Must match turbopack.root — prevents outputFileTracingRoot mismatch error.
  // outputFileTracingRoot is a top-level NextConfig field, not in experimental.
  outputFileTracingRoot: repoRoot,
}

export default nextConfig
