---
name: remotion
description: "Programmatic video creation with React. When Claude needs to: (1) Create videos from prompts or scripts, (2) Generate social media content (TikTok, Reels, Shorts), (3) Build marketing/promotional videos, (4) Create product demos and tutorials, (5) Animate data visualizations, (6) Produce any video content programmatically"
license: MIT
---

# Remotion - Programmatic Video Creation

## Overview

Remotion treats video as a function of time. You provide a frame number and render React components that change each frame to create animations. This skill enables Claude to create professional videos from natural language descriptions.

## Core Concepts

### The Frame System
- Videos are sequences of frames rendered at a specific FPS
- First frame is `0`, last frame is `durationInFrames - 1`
- `useCurrentFrame()` hook returns current frame number
- `useVideoConfig()` returns dimensions, fps, duration

### Composition Registration
Every video must be registered as a `<Composition>`:

```tsx
import { Composition } from 'remotion';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideoComponent}
        durationInFrames={300}  // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "My Video",
        }}
      />
    </>
  );
};
```

### Sequences for Timing
`<Sequence>` components control when content appears:

```tsx
import { Sequence } from 'remotion';

const MyVideo: React.FC = () => {
  return (
    <>
      {/* Intro: frames 0-60 (2 seconds) */}
      <Sequence from={0} durationInFrames={60}>
        <IntroScene />
      </Sequence>

      {/* Main content: frames 60-240 */}
      <Sequence from={60} durationInFrames={180}>
        <MainContent />
      </Sequence>

      {/* Outro: frames 240-300 */}
      <Sequence from={240}>
        <OutroScene />
      </Sequence>
    </>
  );
};
```

## Video Presets

### Standard Formats

| Format | Dimensions | FPS | Use Case |
|--------|------------|-----|----------|
| 1080p Landscape | 1920x1080 | 30 | YouTube, Web |
| 1080p Portrait | 1080x1920 | 30 | TikTok, Reels, Shorts |
| 4K Landscape | 3840x2160 | 30 | High quality |
| Square | 1080x1080 | 30 | Instagram Posts |
| Twitter Video | 1280x720 | 30 | Twitter/X |

### Duration Guidelines

| Content Type | Typical Duration | Frames @30fps |
|--------------|------------------|---------------|
| TikTok/Reel | 15-60 sec | 450-1800 |
| YouTube Short | 60 sec max | 1800 |
| Product Demo | 30-120 sec | 900-3600 |
| Marketing Promo | 15-30 sec | 450-900 |
| Data Viz | 10-30 sec | 300-900 |

## Animation Patterns

### Basic Interpolation
```tsx
import { useCurrentFrame, interpolate } from 'remotion';

const FadeIn: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 30],           // Input range (frames)
    [0, 1],            // Output range (opacity)
    { extrapolateRight: 'clamp' }
  );

  return <div style={{ opacity }}>Hello</div>;
};
```

### Spring Animation
```tsx
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';

const BounceIn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5,
    },
  });

  return <div style={{ transform: `scale(${scale})` }}>Bounce!</div>;
};
```

### Easing Functions
```tsx
import { Easing, interpolate } from 'remotion';

// Available easings
const easings = {
  linear: Easing.linear,
  easeIn: Easing.ease,
  easeInOut: Easing.inOut(Easing.ease),
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  bezier: Easing.bezier(0.25, 0.1, 0.25, 1),
};

const slide = interpolate(frame, [0, 30], [0, 100], {
  easing: Easing.inOut(Easing.ease),
});
```

## Component Architecture

### Scene Structure
```
src/
├── Root.tsx              # Composition registration
├── Video.tsx             # Main video component
├── scenes/
│   ├── Intro.tsx         # Opening scene
│   ├── Content.tsx       # Main content scenes
│   └── Outro.tsx         # Closing scene
├── components/
│   ├── AnimatedText.tsx  # Text with animations
│   ├── Logo.tsx          # Brand elements
│   ├── Background.tsx    # Backgrounds/gradients
│   └── Transitions.tsx   # Scene transitions
└── styles/
    └── global.css        # TailwindCSS styles
```

### Pre-Built Components

#### Animated Text
```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  style?: 'fadeIn' | 'typewriter' | 'slideUp' | 'scaleIn';
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  style = 'fadeIn',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  // Style-specific animations
  const animations = {
    fadeIn: {
      opacity: interpolate(adjustedFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    },
    slideUp: {
      opacity: interpolate(adjustedFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      transform: `translateY(${interpolate(adjustedFrame, [0, 20], [30, 0], { extrapolateRight: 'clamp' })}px)`,
    },
    scaleIn: {
      opacity: interpolate(adjustedFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
      transform: `scale(${spring({ frame: adjustedFrame, fps, config: { damping: 12 } })})`,
    },
    typewriter: {
      // Reveal characters over time
    },
  };

  return <span style={animations[style]}>{text}</span>;
};
```

#### Progress Bar
```tsx
export const ProgressBar: React.FC<{ progress: number; color?: string }> = ({
  progress,
  color = '#3B82F6',
}) => {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};
```

#### Counter Animation
```tsx
export const AnimatedCounter: React.FC<{
  from: number;
  to: number;
  duration: number;  // in frames
}> = ({ from, to, duration }) => {
  const frame = useCurrentFrame();

  const value = interpolate(
    frame,
    [0, duration],
    [from, to],
    { extrapolateRight: 'clamp' }
  );

  return <span>{Math.round(value).toLocaleString()}</span>;
};
```

## Media Handling

### Static Files
```tsx
import { staticFile } from 'remotion';

// Files from public/ directory
const logo = staticFile('logo.png');
const music = staticFile('background-music.mp3');
```

### Images
```tsx
import { Img, staticFile } from 'remotion';

<Img src={staticFile('product.png')} style={{ width: 500 }} />
```

### Video Clips
```tsx
import { Video, staticFile, useVideoConfig } from 'remotion';

<Video
  src={staticFile('clip.mp4')}
  startFrom={0}
  endAt={150}
  volume={0.5}
/>
```

### Audio
```tsx
import { Audio, staticFile, interpolate, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();
const volume = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

<Audio src={staticFile('music.mp3')} volume={volume} />
```

## TailwindCSS Integration

Remotion works seamlessly with TailwindCSS:

```tsx
// tailwind.config.js is auto-configured during setup
// Use Tailwind classes in components

const Scene: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-600 to-purple-700">
      <h1 className="text-6xl font-bold text-white drop-shadow-lg">
        Welcome
      </h1>
    </div>
  );
};
```

## Rendering Workflow

### Development Preview
```bash
npm run dev
# Opens Remotion Studio at http://localhost:3000
```

### Render to File
```bash
# Render specific composition
npx remotion render src/index.ts MyVideo out/video.mp4

# With options
npx remotion render src/index.ts MyVideo out/video.mp4 \
  --codec=h264 \
  --quality=80 \
  --frames=0-300
```

### Programmatic Rendering
```typescript
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const bundled = await bundle({
  entryPoint: './src/index.ts',
  webpackOverride: (config) => config,
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: 'MyVideo',
});

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: 'out/video.mp4',
});
```

### Output Formats

| Codec | Extension | Use Case |
|-------|-----------|----------|
| h264 | .mp4 | Universal compatibility |
| h265 | .mp4 | Smaller files, less support |
| vp8 | .webm | Web playback |
| vp9 | .webm | High quality web |
| prores | .mov | Professional editing |
| gif | .gif | Animations, no audio |

## Project Setup

### Initialize New Project
```bash
npx create-video@latest my-video
cd my-video
npm install
npm run dev
```

### Recommended Options
- Template: Blank
- TailwindCSS: Yes
- Install skills: Yes (for Claude Code)

### Add to Existing Monorepo
```bash
# In frontend/ or new remotion/ workspace
npm install remotion @remotion/cli @remotion/renderer
npm install -D tailwindcss postcss autoprefixer
```

## MCP Server Integration

### Setup for Claude Code
Add to your MCP configuration:

```json
{
  "mcpServers": {
    "remotion": {
      "command": "npx",
      "args": ["@remotion/mcp@latest"]
    }
  }
}
```

### Capabilities
- Documentation lookup via vector search
- Best practices guidance
- API reference queries

## Workflow with Claude

### From Prompt to Video

1. **Describe** - Natural language description of desired video
2. **Structure** - Claude creates scene breakdown with timing
3. **Generate** - Claude writes React components
4. **Preview** - Render preview frames for validation
5. **Iterate** - Refine based on feedback
6. **Render** - Export final video

### Example Prompt
```
Create a 30-second product announcement video for our SaaS launch:
- Opening: Logo animation with tagline "Simplify Your Workflow"
- Scene 1: Show 3 key features with icons and text
- Scene 2: Pricing comparison chart animation
- Closing: CTA "Start Free Trial" with website URL
- Style: Modern, blue/purple gradient, clean typography
- Format: 1080p landscape for YouTube
```

## Dependencies

### Required
```bash
npm install remotion @remotion/cli @remotion/player
```

### For Rendering
```bash
npm install @remotion/renderer @remotion/bundler
```

### For Media
```bash
npm install @remotion/media-utils  # Duration detection, thumbnails
```

### For Effects
```bash
npm install @remotion/transitions  # Scene transitions
npm install @remotion/motion-blur  # Motion blur effects
npm install @remotion/noise        # Noise/grain effects
```

## Best Practices

### Performance
- Use `useMemo` for expensive calculations
- Avoid re-creating objects each frame
- Use `staticFile()` for assets
- Leverage `<Sequence>` to unmount unused components

### Code Quality
- Type all props with interfaces
- Keep components small and focused
- Use descriptive composition IDs
- Comment timing decisions

### Design
- Maintain consistent visual language
- Use spring animations for natural motion
- Account for safe zones on different platforms
- Test on target playback devices

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot find composition" | ID mismatch | Check composition `id` prop |
| Blank frames | Missing return | Ensure component returns JSX |
| Audio sync issues | Wrong FPS | Match audio to video FPS |
| Memory errors | Large assets | Optimize images, use streaming |
| Render timeout | Complex scenes | Increase timeout, optimize code |

## Integration with Other Skills

### From PPTX Skill
Convert presentations to video:
```
1. Read PPTX with markitdown
2. Extract slides and content
3. Generate Remotion scenes from slides
4. Add transitions and animations
5. Render to video
```

### From Theme Factory
Apply brand themes:
```
1. Load theme configuration
2. Extract colors, fonts, spacing
3. Generate Tailwind config
4. Apply to video components
```

### From Canvas Design
Use generated assets:
```
1. Create visual assets with canvas-design
2. Export as PNG/SVG
3. Import into Remotion scenes
4. Animate with interpolation
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-27 | Initial skill creation |

## Credits

**Created By:** Quik Nation AI Team
**Documentation Source:** [remotion.dev](https://www.remotion.dev/docs)
**MCP Server:** `@remotion/mcp@latest`
