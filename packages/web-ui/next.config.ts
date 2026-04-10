import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @cloudflare/next-on-pages compatibility
  // Note: edge runtime is set per-route via `export const runtime = 'edge'`
  // in layout.tsx / page.tsx, not here
}

export default nextConfig
