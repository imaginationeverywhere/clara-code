import path from 'path'
import type { NextConfig } from 'next'

// CI: `cd frontend && npm run build` runs next build with CWD=frontend/.
// distDir:'../.next' writes output to repo root so vercel build (CWD=repo root)
// finds routes-manifest.json at its expected location (CWD/.next/).
// outputFileTracingRoot=repoRoot roots .nft.json traces at repo root where
// npm workspaces hoist node_modules/.
// webpack() forces webpack mode: Next.js 16 defaults to Turbopack which skips
// .nft.json generation. Any webpack config key opts out of Turbopack.
const repoRoot = path.resolve(process.cwd(), '..')

const nextConfig: NextConfig = {
  typescript: {
    // Type checking handled by CI (npm run check / tsgo --noEmit)
    ignoreBuildErrors: true,
  },
  distDir: '../.next',
  outputFileTracingRoot: repoRoot,
  // HERMES_GATEWAY_URL is read only in Route Handlers (server). Do not add it to `env` here —
  // Next.js would inline it into the client bundle.
  // Forces webpack — Next.js 16 uses Turbopack by default. Turbopack skips
  // .nft.json generation which causes Vercel CLI to crash during file tracing
  // when distDir is outside the project directory.
  webpack: (config) => config,
}

export default nextConfig
