import type { NextConfig } from 'next'

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
    // Anchor Turbopack root to this directory (frontend/).
    // Without this, Turbopack auto-detects the monorepo root via pnpm-lock.yaml
    // and fails to resolve next/package.json in CI.
    root: process.cwd(),
  },
}

export default nextConfig
