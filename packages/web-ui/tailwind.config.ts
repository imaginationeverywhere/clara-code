import type { Config } from 'tailwindcss'

// Clara Code — single design system for both site and desktop app surfaces
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        clara: {
          DEFAULT: '#3B82F6',
          500: '#3B82F6',
        },
        brand: {
          purple: '#7C3AED',
          blue:   '#4F8EF7',
          green:  '#10B981',
        },
        bg: {
          base:    '#0D1117',
          raised:  '#0F1318',
          overlay: '#0A0E14',
          sunken:  '#070A0F',
        },
        syntax: {
          keyword:   '#7C3AED',
          type:      '#4F8EF7',
          string:    '#10B981',
          jsx:       '#F87171',
          attribute: '#FBBF24',
          number:    '#FB923C',
        },
      },
      width: {
        sidebar:   '13rem',
        'ai-panel': '18rem',
      },
      height: {
        topbar:    '2.75rem',
        voicebar:  '5rem',
        tabbar:    '2.25rem',
      },
      boxShadow: {
        cta:     '0 0 30px rgba(124,58,237,0.35)',
        card:    '0 40px 80px rgba(0,0,0,0.50)',
        mic:     '0 0 24px rgba(124,58,237,0.60)',
        purple:  '0 0 32px rgba(124,58,237,0.40)',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { height: '4px' },
          '50%':      { height: '20px' },
        },
      },
      animation: {
        waveform: 'waveform 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
