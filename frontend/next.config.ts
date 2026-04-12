import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Monorepo: avoid wrong workspace root when multiple lockfiles exist (npm + pnpm)
  turbopack: {
    root: path.resolve(process.cwd(), '..'),
  },
  // @cloudflare/next-on-pages compatibility
  // Note: edge runtime is set per-route via `export const runtime = 'edge'`
  // in layout.tsx / page.tsx, not here
  typescript: {
    // Type checking is handled by the CI workflow (npm run check / tsgo --noEmit)
    // Workspace-local packages (@mariozechner/*) are not resolvable by Vercel CLI in CI
    ignoreBuildErrors: true,
  },
}

export default nextConfig
