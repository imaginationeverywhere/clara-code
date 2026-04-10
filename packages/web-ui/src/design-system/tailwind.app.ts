/**
 * Clara Code — App Design System (IDE interface surface)
 * Extends the base Tailwind config for the (app) route group
 *
 * Used in: packages/web-ui/tailwind.config.ts
 * Surface: clara-code IDE — file tree, code panel, AI panel, voice bar
 *
 * DESIGN PRINCIPLE: Voice is the home state. Text is the escape hatch.
 * The mic button is always the most prominent interactive element.
 */

export const appTokens = {
  colors: {
    // Inherited from site tokens — same brand
    purple:  '#7C3AED',
    blue:    '#4F8EF7',
    green:   '#10B981',

    // Panel backgrounds (darker than site)
    panel: {
      base:    '#0D1117',   // code editor
      sidebar: '#090D12',   // file tree + AI panel
      bar:     '#0A0E14',   // top bar + voice bar
      input:   '#070A0F',   // search inputs, code blocks
    },

    // Syntax highlighting
    syntax: {
      keyword:    '#7C3AED',  // import, export, const, function
      type:       '#4F8EF7',  // TypeScript types
      string:     '#10B981',  // string literals, transcripts
      jsx:        '#F87171',  // JSX tags (red-400/80)
      attribute:  '#FBBF24',  // JSX attributes (yellow-400/70)
      comment:    'rgba(255,255,255,0.28)',
      plain:      'rgba(255,255,255,0.85)',
      number:     '#FB923C',
    },

    // File type icon colors
    fileType: {
      tsx: '#4F8EF7',     // TypeScript React
      ts:  '#EAB308',     // TypeScript
      css: '#7C3AED',     // Stylesheets
      json: '#10B981',    // JSON
      md:  'rgba(255,255,255,0.30)',  // Markdown
    },
  },

  // Panel dimensions (as CSS custom properties in tokens.css)
  panels: {
    sidebarWidth:   '13rem',    // --panel-sidebar-width
    aiPanelWidth:   '18rem',    // --panel-ai-width
    topBarHeight:   '2.75rem',  // --panel-topbar-height
    voiceBarHeight: '5rem',     // --panel-voicebar-height
    tabBarHeight:   '2.25rem',  // --tab-height
  },

  // Code editor typography
  code: {
    fontSize:   '0.8125rem',  // 13px
    lineHeight: '1.7',
    lineNumberColor: 'rgba(255,255,255,0.18)',
    activeLineColor: 'rgba(255,255,255,0.025)',
    activeLine: {
      bg:     'rgba(255,255,255,0.025)',
      border: 'rgba(124, 58, 237, 0.40)',
    },
  },
} as const

/**
 * App Component Tokens
 *
 * ━━━ TOP BAR ━━━
 * h-11 flex items-center border-b border-white/6 bg-[#0A0E14]
 *
 * ━━━ SIDEBAR (file tree + AI panel) ━━━
 * bg-[#090D12] border-r border-white/6
 *
 * ━━━ FILE TREE ITEM (inactive) ━━━
 * flex items-center h-7 px-2 rounded-md gap-1.5
 * hover:bg-white/4 cursor-pointer text-white/60 text-[12px] font-mono
 *
 * ━━━ FILE TREE ITEM (active) ━━━
 * bg-[#7C3AED]/10 border border-[#7C3AED]/15 text-white
 *
 * ━━━ CODE PANEL TABS ━━━
 * h-9 bg-[#0A0E14] border-b border-white/6
 * Active tab: bg-[#0D1117] border-t border-l border-r border-white/8 border-b-0
 *
 * ━━━ VOICE BAR (voice mode — DEFAULT) ━━━
 * h-20 border-t border-white/6 bg-[#0A0E14]
 * Mic button: w-12 h-12 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30
 *   Listening: bg-[#7C3AED] shadow-[0_0_24px_rgba(124,58,237,0.6)] scale-110
 * Text toggle: w-7 h-7 rounded-md border border-white/10 text-white/30
 *   (keyboard icon — small, secondary, right-aligned)
 *
 * ━━━ VOICE BAR (text mode — TOGGLED) ━━━
 * Small mic: w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/40
 * Text input: flex-1 bg-[#0D1117] border border-white/10 rounded-xl px-4 py-2.5
 *   focus:border-[#7C3AED]/40 focus:ring-1 focus:ring-[#7C3AED]/20 font-mono
 * Send: bg-[#7C3AED] w-8 h-8 rounded-lg
 *
 * ━━━ AI PANEL MESSAGE (user / voice transcript) ━━━
 * bg-[#7C3AED]/12 border border-[#7C3AED]/15 rounded-2xl rounded-tr-sm
 *
 * ━━━ AI PANEL MESSAGE (assistant) ━━━
 * bg-white/[0.04] border border-white/6 rounded-2xl rounded-tl-sm
 *
 * ━━━ AI PANEL CODE BLOCK ━━━
 * bg-[#0D1117] rounded-xl border border-white/6 font-mono text-[11px]
 *
 * ━━━ WAVEFORM (listening state) ━━━
 * 12-16 bars: w-1 rounded-full bg-[#7C3AED]
 * Heights: 4px → 20px cycling with staggered animation-delay
 */
