# Social Media Template

**Type:** Social Media Content
**Duration:** 15-60 seconds
**Formats:** Portrait (9:16) - TikTok, Reels, Shorts

## Use Cases

- TikTok trends
- Instagram Reels
- YouTube Shorts
- Quick announcements
- Behind-the-scenes
- Tips and tricks
- Product showcases

## Critical Rules for Social Media

### First 3 Seconds
- **Hook IMMEDIATELY** - viewers decide in 1-3 seconds
- Start with movement or bold text
- Ask a question or make a bold claim
- Don't start with logos or slow fades

### Mobile-First Design
- Text size minimum 48px (visible on phones)
- Keep important content in center 80% (safe zone)
- Vertical format is mandatory (1080x1920)
- High contrast colors for outdoor viewing

### Pacing
- Fast cuts (2-4 seconds per scene max)
- Match transitions to music beats
- End with clear CTA

## Scene Components

### Hook Scene (Attention Grabber)
```tsx
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface HookSceneProps {
  hookText: string;
  style?: 'bold' | 'question' | 'countdown' | 'reveal';
}

export const SocialHook: React.FC<HookSceneProps> = ({ hookText, style = 'bold' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Different hook styles
  const animations = {
    bold: {
      scale: spring({ frame, fps, config: { damping: 6, stiffness: 200 } }),
      rotate: frame < 10 ? Math.sin(frame * 0.5) * 3 : 0,
    },
    question: {
      scale: spring({ frame, fps, config: { damping: 12 } }),
      opacity: Math.min(1, frame / 8),
    },
    countdown: {
      scale: 1 + (1 - Math.min(1, frame / 30)) * 2,
      opacity: 1,
    },
    reveal: {
      clipPath: `inset(0 ${Math.max(0, 100 - frame * 5)}% 0 0)`,
      scale: 1,
    },
  };

  const anim = animations[style];

  return (
    <AbsoluteFill className="flex items-center justify-center bg-black p-8">
      <h1
        className="text-6xl font-black text-white text-center leading-tight"
        style={{
          transform: `scale(${anim.scale}) rotate(${anim.rotate || 0}deg)`,
          opacity: anim.opacity ?? 1,
          ...(anim.clipPath && { clipPath: anim.clipPath }),
        }}
      >
        {hookText}
      </h1>
    </AbsoluteFill>
  );
};
```

### Quick Tips List
```tsx
interface TipItem {
  emoji: string;
  text: string;
}

interface QuickTipsProps {
  tips: TipItem[];
  title?: string;
}

export const QuickTips: React.FC<QuickTipsProps> = ({ tips, title }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black p-12 gap-6">
      {title && (
        <h2
          className="text-4xl font-bold text-white mb-8"
          style={{ opacity: Math.min(1, frame / 15) }}
        >
          {title}
        </h2>
      )}

      {tips.map((tip, index) => {
        const delay = index * 20;
        const tipFrame = Math.max(0, frame - delay);
        const scale = spring({
          frame: tipFrame,
          fps: 30,
          config: { damping: 10 },
        });

        return (
          <div
            key={index}
            className="flex items-center gap-4 bg-white/10 backdrop-blur px-6 py-4 rounded-2xl w-full"
            style={{
              transform: `scale(${scale})`,
              opacity: Math.min(1, tipFrame / 10),
            }}
          >
            <span className="text-4xl">{tip.emoji}</span>
            <span className="text-2xl text-white font-medium">{tip.text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

### Before/After Split
```tsx
interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  // Animate the divider from left to right
  const dividerPosition = Math.min(width, frame * 20);
  const revealPercent = (dividerPosition / width) * 100;

  return (
    <AbsoluteFill>
      {/* Before image (full) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${beforeImage})` }}
      />

      {/* After image (revealed) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${afterImage})`,
          clipPath: `inset(0 0 0 ${100 - revealPercent}%)`,
        }}
      />

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${revealPercent}%` }}
      />

      {/* Labels */}
      <span className="absolute top-8 left-8 text-2xl font-bold text-white bg-black/50 px-4 py-2 rounded">
        {beforeLabel}
      </span>
      <span
        className="absolute top-8 right-8 text-2xl font-bold text-white bg-black/50 px-4 py-2 rounded"
        style={{ opacity: revealPercent > 50 ? 1 : 0 }}
      >
        {afterLabel}
      </span>
    </AbsoluteFill>
  );
};
```

### Trending Text Overlay
```tsx
interface TextOverlayProps {
  lines: string[];
  position?: 'top' | 'center' | 'bottom';
  animation?: 'typewriter' | 'pop' | 'slide';
}

export const TrendingTextOverlay: React.FC<TextOverlayProps> = ({
  lines,
  position = 'bottom',
  animation = 'pop',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const positionClasses = {
    top: 'items-start pt-24',
    center: 'items-center',
    bottom: 'items-end pb-24',
  };

  return (
    <AbsoluteFill className={`flex flex-col justify-center ${positionClasses[position]} px-8`}>
      {lines.map((line, index) => {
        const delay = index * 15;
        const lineFrame = Math.max(0, frame - delay);

        let style = {};
        if (animation === 'pop') {
          const scale = spring({ frame: lineFrame, fps, config: { damping: 8 } });
          style = { transform: `scale(${scale})`, opacity: Math.min(1, lineFrame / 5) };
        } else if (animation === 'slide') {
          style = {
            transform: `translateX(${Math.max(0, 100 - lineFrame * 8)}px)`,
            opacity: Math.min(1, lineFrame / 10),
          };
        } else if (animation === 'typewriter') {
          const charsToShow = Math.floor(lineFrame / 2);
          line = line.substring(0, charsToShow);
        }

        return (
          <div
            key={index}
            className="text-4xl font-bold text-white text-center mb-4"
            style={{
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
              WebkitTextStroke: '1px black',
              ...style,
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

### CTA Overlay
```tsx
interface SocialCTAProps {
  mainText: string;
  subText?: string;
  style?: 'swipe-up' | 'link-in-bio' | 'follow' | 'subscribe';
}

export const SocialCTA: React.FC<SocialCTAProps> = ({
  mainText,
  subText,
  style = 'link-in-bio',
}) => {
  const frame = useCurrentFrame();

  // Bouncing arrow animation
  const bounce = Math.sin(frame * 0.2) * 10;

  const icons = {
    'swipe-up': '👆',
    'link-in-bio': '🔗',
    follow: '➕',
    subscribe: '🔔',
  };

  return (
    <AbsoluteFill className="flex flex-col items-center justify-end pb-32 bg-gradient-to-t from-black/80 to-transparent">
      {/* Animated arrow/icon */}
      <div
        className="text-6xl mb-4"
        style={{ transform: `translateY(${bounce}px)` }}
      >
        {icons[style]}
      </div>

      {/* Main CTA text */}
      <span className="text-4xl font-bold text-white text-center">{mainText}</span>

      {/* Sub text */}
      {subText && (
        <span className="text-2xl text-gray-300 mt-2">{subText}</span>
      )}
    </AbsoluteFill>
  );
};
```

## Complete TikTok Composition

```tsx
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';

interface TikTokVideoProps {
  hook: string;
  mainContent: React.ReactNode;
  ctaText: string;
  musicFile?: string;
}

export const TikTokVideo: React.FC<TikTokVideoProps> = ({
  hook,
  mainContent,
  ctaText,
  musicFile,
}) => {
  return (
    <AbsoluteFill>
      {/* Background music */}
      {musicFile && <Audio src={staticFile(musicFile)} volume={0.3} />}

      {/* Hook (0-2 seconds) */}
      <Sequence from={0} durationInFrames={60}>
        <SocialHook hookText={hook} style="bold" />
      </Sequence>

      {/* Main content (2-12 seconds) */}
      <Sequence from={60} durationInFrames={300}>
        {mainContent}
      </Sequence>

      {/* CTA (12-15 seconds) */}
      <Sequence from={360}>
        <SocialCTA mainText={ctaText} style="link-in-bio" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Registration Example

```tsx
// In Root.tsx
<Composition
  id="TikTokPromo"
  component={TikTokVideo}
  durationInFrames={450}  // 15 seconds
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{
    hook: "Wait for it... 🤯",
    mainContent: <QuickTips tips={[
      { emoji: '💡', text: 'Tip 1: Start strong' },
      { emoji: '🎯', text: 'Tip 2: Keep it short' },
      { emoji: '🔥', text: 'Tip 3: End with CTA' },
    ]} />,
    ctaText: "Follow for more tips!",
    musicFile: "trending-beat.mp3",
  }}
/>
```

## Platform-Specific Guidelines

### TikTok
- Duration: 15-60 seconds (sweet spot: 21-34 sec)
- Safe zone: Top 150px (username), bottom 270px (UI)
- Audio: Trending sounds boost visibility
- Text: Large, readable, high contrast

### Instagram Reels
- Duration: 15-90 seconds (recommended: 15-30 sec)
- Safe zone: Similar to TikTok
- Audio: Use Instagram music library
- Cover frame: Important for profile grid

### YouTube Shorts
- Duration: Up to 60 seconds
- Can include #Shorts in title
- Vertical only (9:16)
- Thumbnail auto-generated from video

## Trending Formats

### POV Format
```tsx
const povContent = (
  <>
    <TrendingTextOverlay
      lines={["POV:", "You just discovered", "the best app ever"]}
      position="top"
    />
    {/* Background video/content */}
  </>
);
```

### This or That
```tsx
const thisOrThat = (
  <AbsoluteFill className="flex flex-col">
    <div className="flex-1 bg-blue-500 flex items-center justify-center">
      <span className="text-6xl">Option A 👆</span>
    </div>
    <div className="flex-1 bg-red-500 flex items-center justify-center">
      <span className="text-6xl">Option B 👇</span>
    </div>
  </AbsoluteFill>
);
```

### Countdown/List
```tsx
const countdownTips = {
  tips: [
    { emoji: '3️⃣', text: 'Third best tip' },
    { emoji: '2️⃣', text: 'Second best tip' },
    { emoji: '1️⃣', text: 'The BEST tip!' },
  ],
  title: 'TOP 3 TIPS 🔥',
};
```

## Audio Sync Tips

1. **Find the BPM** of your music
2. **Calculate frames per beat**: `fps * 60 / BPM`
3. **Align cuts** to beat frames
4. **Use markers** for key moments

```tsx
// Example: 120 BPM song at 30fps = 15 frames per beat
const beatsToFrames = (beats: number, bpm: number, fps: number) => {
  return Math.round(beats * (fps * 60) / bpm);
};

// Cut at beat 4 (2 seconds in for 120 BPM)
const cutFrame = beatsToFrames(4, 120, 30); // = 60
```
