import type { Config } from 'tailwindcss'
import { siteTokens } from './src/design-system/tailwind.site'
import { appTokens } from './src/design-system/tailwind.app'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/design-system/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: siteTokens.fontFamily.sans,
        mono: siteTokens.fontFamily.mono,
      },
      colors: {
        // Brand palette — shared across both surfaces
        brand: {
          purple:       siteTokens.colors.purple.DEFAULT,
          'purple-dim': siteTokens.colors.purple[100],
          blue:         siteTokens.colors.blue.DEFAULT,
          'blue-dim':   siteTokens.colors.blue.dim,
          green:        siteTokens.colors.green.DEFAULT,
          'green-dim':  siteTokens.colors.green.dim,
        },
        // Background shades
        bg: {
          base:    siteTokens.colors.bg.base,
          raised:  siteTokens.colors.bg.raised,
          overlay: siteTokens.colors.bg.overlay,
          sunken:  siteTokens.colors.bg.sunken,
        },
        // App surface panels
        panel: {
          base:    appTokens.colors.panel.base,
          sidebar: appTokens.colors.panel.sidebar,
          bar:     appTokens.colors.panel.bar,
          input:   appTokens.colors.panel.input,
        },
        // Syntax highlighting
        syntax: {
          keyword:   appTokens.colors.syntax.keyword,
          type:      appTokens.colors.syntax.type,
          string:    appTokens.colors.syntax.string,
          jsx:       appTokens.colors.syntax.jsx,
          attribute: appTokens.colors.syntax.attribute,
          comment:   appTokens.colors.syntax.comment,
          plain:     appTokens.colors.syntax.plain,
          number:    appTokens.colors.syntax.number,
        },
      },
      borderRadius: {
        card:   siteTokens.borderRadius.card,
        badge:  siteTokens.borderRadius.badge,
        button: siteTokens.borderRadius.button,
        input:  siteTokens.borderRadius.input,
      },
      boxShadow: {
        cta:       siteTokens.boxShadow.cta,
        'cta-lg':  siteTokens.boxShadow['cta-lg'],
        card:      siteTokens.boxShadow.card,
        'card-sm': siteTokens.boxShadow['card-sm'],
        'mic-active': '0 0 24px rgba(124, 58, 237, 0.60)',
        'glow-purple': '0 0 32px rgba(124, 58, 237, 0.40)',
      },
      // Panel dimension utilities (app surface)
      width: {
        sidebar: appTokens.panels.sidebarWidth,
        'ai-panel': appTokens.panels.aiPanelWidth,
      },
      height: {
        topbar: appTokens.panels.topBarHeight,
        voicebar: appTokens.panels.voiceBarHeight,
        tabbar: appTokens.panels.tabBarHeight,
      },
      maxWidth: {
        content: '80rem',   // max-w-5xl equivalent
        hero: '48rem',      // max-w-3xl for hero copy
      },
      // Animation
      keyframes: {
        waveform: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '20px' },
        },
        'mic-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
      },
      animation: {
        waveform: 'waveform 1s ease-in-out infinite',
        'mic-pulse': 'mic-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
