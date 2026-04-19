# Fix Hero Section — Match Magic Patterns Design

**Source:** mockups/site/src/components/HeroSection.tsx
**Target:** frontend/src/components/marketing/HeroSection.tsx

## What's Wrong

The Hero section is missing several visual elements from the Magic Patterns design and has wrong copy in places.

## Required Fixes

### 1. Add Dot Grid Background Pattern

The mockup has a dot grid texture behind the hero. Add it to `HeroSection.tsx`:

```tsx
// Add inside the hero container, as the first child
<div
  className="absolute inset-0 pointer-events-none"
  style={{
    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)`,
    backgroundSize: '28px 28px',
  }}
/>
```

### 2. Fix Eyebrow Badge Text

**Current:** "Open source · MIT licensed"
**Correct:** "Now in Beta"

Find the eyebrow badge in `HeroSection.tsx` and update the text.

### 3. Add Social Proof Row

The mockup has a social proof block below the CTA buttons. Add this after the CTA button group:

```tsx
<div className="flex items-center gap-3 mt-6">
  {/* 5 stacked avatars */}
  <div className="flex -space-x-2">
    {[1,2,3,4,5].map((i) => (
      <div
        key={i}
        className="w-8 h-8 rounded-full border-2 border-[#0D1117] bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7] flex items-center justify-center text-xs text-white font-bold"
      >
        {['A','B','C','D','E'][i-1]}
      </div>
    ))}
  </div>
  <p className="text-sm text-white/50">
    Trusted by <span className="text-white/80 font-medium">2,400+ developers</span>
  </p>
</div>
```

### 4. Add Second Radial Glow

The mockup has TWO glows — purple top-left AND blue bottom-right. Currently there's only one. Add the second:

```tsx
{/* Existing purple glow - keep as-is */}
{/* Add blue glow bottom-right */}
<div
  className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
  style={{
    background: 'radial-gradient(circle at 80% 80%, rgba(79,142,247,0.12) 0%, transparent 70%)',
  }}
/>
```

## Acceptance Criteria

- [ ] Dot grid pattern visible across the entire hero background
- [ ] Eyebrow badge reads "Now in Beta"
- [ ] Social proof row with 5 avatars and "2,400+ developers" text appears below CTAs
- [ ] Blue glow visible in bottom-right of hero
- [ ] No TypeScript errors (`cd frontend && npm run type-check`)
- [ ] No lint errors (`npm run lint`)
