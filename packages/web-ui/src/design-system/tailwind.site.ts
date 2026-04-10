/**
 * Clara Code — Site Design System (claracode.ai marketing surface)
 * Extends the base Tailwind config for the (marketing) route group
 *
 * Used in: packages/web-ui/tailwind.config.ts (already imports this)
 * Surface: claracode.ai landing, pricing, features, waitlist
 */

export const siteTokens = {
  colors: {
    // Brand
    purple: {
      DEFAULT: '#7C3AED',
      light:   '#9F67F7',
      50:  'rgba(124, 58, 237, 0.05)',
      100: 'rgba(124, 58, 237, 0.10)',
      200: 'rgba(124, 58, 237, 0.20)',
      300: 'rgba(124, 58, 237, 0.30)',
    },
    blue: {
      DEFAULT: '#4F8EF7',
      dim:     'rgba(79, 142, 247, 0.15)',
    },
    green: {
      DEFAULT: '#10B981',
      dim:     'rgba(16, 185, 129, 0.12)',
      border:  'rgba(16, 185, 129, 0.25)',
    },
    // Backgrounds
    bg: {
      base:    '#0D1117',
      raised:  '#0F1318',
      overlay: '#0A0E14',
      sunken:  '#070A0F',
    },
  },

  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  borderRadius: {
    card:   '1rem',      // 16px — marketing cards
    button: '9999px',   // pill — all CTAs
    badge:  '9999px',   // eyebrow pills
    input:  '0.75rem',  // 12px — form inputs
  },

  boxShadow: {
    cta:        '0 0 30px rgba(124, 58, 237, 0.35)',
    'cta-lg':   '0 0 50px rgba(124, 58, 237, 0.45)',
    card:       '0 40px 80px rgba(0, 0, 0, 0.50)',
    'card-sm':  '0 8px 32px rgba(0, 0, 0, 0.40)',
  },

  // Section spacing (applied via className="site-section")
  // py-28 = 7rem top+bottom
  spacing: {
    section: '7rem',
    'section-sm': '5rem',
  },
} as const

/**
 * Site Component Tokens
 *
 * Eyebrow badge:
 *   border border-[#7C3AED]/30 bg-[#7C3AED]/8 text-[#7C3AED]
 *   text-[11px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full
 *
 * H1 gradient word:
 *   bg-gradient-to-r from-[#7C3AED] to-[#4F8EF7] bg-clip-text text-transparent
 *
 * Primary CTA:
 *   bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full px-7 py-3.5
 *   text-[15px] font-semibold shadow-[0_0_30px_rgba(124,58,237,0.35)]
 *
 * Ghost CTA:
 *   border border-white/15 hover:border-white/30 text-white/70 hover:text-white
 *   rounded-full px-7 py-3.5 text-[15px]
 *
 * Feature card:
 *   rounded-2xl border border-white/8 bg-[#0D1117] p-8
 *   hover:border-[#7C3AED]/30 hover:bg-white/[0.02] transition-all duration-200
 *
 * Pricing card (featured):
 *   ring-1 ring-[#7C3AED]/40 border border-[#7C3AED]/30
 *   bg-gradient-to-b from-[#7C3AED]/8 to-[#0A0E14]
 *   shadow-[0_0_60px_rgba(124,58,237,0.15)]
 */
