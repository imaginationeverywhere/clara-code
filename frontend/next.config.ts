import path from 'path'
import type { NextConfig } from 'next'

// In CI, npm workspaces hoist `next` to the repo root node_modules/.
// Turbopack requires turbopack.root to find next/package.json outside frontend/.
// outputFileTracingRoot must equal turbopack.root — Next.js enforces they match.
// Both point to repo root. @cloudflare/next-on-pages runs from repo root (via
// vercel.json rootDirectory:"frontend") so Vercel CLI resolves paths from repo root
// correctly — no frontend/frontend/.next/ doubling.
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
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
}

export default nextConfig
