import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type checking handled by CI (npm run check / tsgo --noEmit)
    ignoreBuildErrors: true,
  },
  // HERMES_GATEWAY_URL is read only in Route Handlers (server). Do not add it to `env` here —
  // Next.js would inline it into the client bundle.
}

export default nextConfig
