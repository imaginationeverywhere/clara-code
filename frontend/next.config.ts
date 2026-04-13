import path from 'path'
import type { NextConfig } from 'next'

// CI: `cd frontend && npm run build` runs next build with CWD=frontend/.
// distDir:'../.next' writes output to repo root so vercel build (CWD=repo root)
// finds routes-manifest.json at its expected location (CWD/.next/).
// outputFileTracingRoot=repoRoot roots .nft.json traces at repo root where
// npm workspaces hoist node_modules/.
// Turbopack is intentionally NOT used: Turbopack skips .nft.json generation,
// causing Vercel CLI to fall back to manual tracing which crashes on distDir
// paths outside frontend/. Webpack generates .nft.json correctly.
const repoRoot = path.resolve(process.cwd(), '..')

const nextConfig: NextConfig = {
  typescript: {
    // Type checking handled by CI (npm run check / tsgo --noEmit)
    ignoreBuildErrors: true,
  },
  distDir: '../.next',
  outputFileTracingRoot: repoRoot,
}

export default nextConfig
