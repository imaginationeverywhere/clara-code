# Marketing Promo Template

**Type:** Marketing/Promotional
**Duration:** 15-60 seconds
**Formats:** Landscape (16:9), Portrait (9:16), Square (1:1)

## Use Cases

- Product launches
- Sale announcements
- Brand introductions
- Event promotions
- Feature highlights

## Scene Structure

### Scene 1: Hook (0-3 seconds)
**Purpose:** Grab attention immediately

```tsx
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface HookSceneProps {
  headline: string;
  accentColor: string;
}

export const HookScene: React.FC<HookSceneProps> = ({ headline, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 8, stiffness: 200 } });
  const opacity = Math.min(1, frame / 10);

  return (
    <AbsoluteFill className="flex items-center justify-center bg-black">
      {/* Radial pulse effect */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
          transform: `scale(${1 + Math.sin(frame * 0.1) * 0.1})`,
        }}
      />

      {/* Main headline */}
      <h1
        className="text-video-2xl font-black text-white text-center uppercase tracking-wide"
        style={{
          opacity,
          transform: `scale(${scale})`,
          textShadow: `0 0 60px ${accentColor}`,
        }}
      >
        {headline}
      </h1>
    </AbsoluteFill>
  );
};
```

### Scene 2: Value Proposition (3-12 seconds)
**Purpose:** Present key benefits or features

```tsx
interface ValuePropSceneProps {
  points: Array<{ icon: string; text: string }>;
  accentColor: string;
}

export const ValuePropScene: React.FC<ValuePropSceneProps> = ({ points, accentColor }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center gap-8 bg-gray-900 p-16">
      {points.map((point, index) => {
        const delay = index * 30; // Stagger by 1 second
        const pointFrame = Math.max(0, frame - delay);
        const opacity = Math.min(1, pointFrame / 15);
        const translateX = Math.max(0, 50 - pointFrame * 3);

        return (
          <div
            key={index}
            className="flex items-center gap-6"
            style={{ opacity, transform: `translateX(${translateX}px)` }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: accentColor }}
            >
              {point.icon}
            </div>
            <span className="text-video-lg text-white font-semibold">
              {point.text}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

### Scene 3: Social Proof (Optional, 3-5 seconds)
**Purpose:** Build credibility

```tsx
interface SocialProofSceneProps {
  metric: string;
  label: string;
  testimonial?: string;
}

export const SocialProofScene: React.FC<SocialProofSceneProps> = ({
  metric,
  label,
  testimonial,
}) => {
  const frame = useCurrentFrame();

  // Animate counter if metric is a number
  const numericValue = parseInt(metric.replace(/\D/g, ''));
  const animatedValue = Math.min(
    numericValue,
    Math.round(numericValue * (frame / 60))
  );
  const displayMetric = metric.includes('+')
    ? `${animatedValue.toLocaleString()}+`
    : animatedValue.toLocaleString();

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <span className="text-video-3xl font-black text-white">{displayMetric}</span>
      <span className="text-video-lg text-gray-400 mt-4">{label}</span>
      {testimonial && (
        <p className="text-video-base text-gray-300 mt-8 max-w-2xl text-center italic">
          "{testimonial}"
        </p>
      )}
    </AbsoluteFill>
  );
};
```

### Scene 4: Call to Action (3-5 seconds)
**Purpose:** Drive desired action

```tsx
interface CTASceneProps {
  ctaText: string;
  subtext?: string;
  accentColor: string;
}

export const CTAScene: React.FC<CTASceneProps> = ({ ctaText, subtext, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const buttonScale = spring({ frame, fps, config: { damping: 10 } });
  const pulseScale = 1 + Math.sin(frame * 0.15) * 0.05;

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-black">
      {/* CTA Button */}
      <div
        className="px-16 py-8 rounded-full font-bold text-video-xl text-white"
        style={{
          backgroundColor: accentColor,
          transform: `scale(${buttonScale * pulseScale})`,
          boxShadow: `0 0 40px ${accentColor}80`,
        }}
      >
        {ctaText}
      </div>

      {/* Subtext */}
      {subtext && (
        <span
          className="text-video-base text-gray-400 mt-8"
          style={{ opacity: Math.min(1, (frame - 20) / 15) }}
        >
          {subtext}
        </span>
      )}
    </AbsoluteFill>
  );
};
```

## Complete Composition

```tsx
import { AbsoluteFill, Sequence } from 'remotion';

interface MarketingPromoProps {
  headline: string;
  valuePoints: Array<{ icon: string; text: string }>;
  metric?: string;
  metricLabel?: string;
  ctaText: string;
  ctaSubtext?: string;
  accentColor?: string;
  duration?: number; // in seconds
}

export const MarketingPromo: React.FC<MarketingPromoProps> = ({
  headline,
  valuePoints,
  metric,
  metricLabel,
  ctaText,
  ctaSubtext,
  accentColor = '#3B82F6',
  duration = 30,
}) => {
  const fps = 30;
  const totalFrames = duration * fps;

  // Calculate scene durations
  const hookDuration = 3 * fps;      // 90 frames
  const valueDuration = (valuePoints.length * 3 + 3) * fps;
  const socialDuration = metric ? 4 * fps : 0;
  const ctaDuration = totalFrames - hookDuration - valueDuration - socialDuration;

  let currentFrame = 0;

  return (
    <AbsoluteFill>
      {/* Scene 1: Hook */}
      <Sequence from={currentFrame} durationInFrames={hookDuration}>
        <HookScene headline={headline} accentColor={accentColor} />
      </Sequence>
      {(currentFrame += hookDuration)}

      {/* Scene 2: Value Proposition */}
      <Sequence from={currentFrame} durationInFrames={valueDuration}>
        <ValuePropScene points={valuePoints} accentColor={accentColor} />
      </Sequence>
      {(currentFrame += valueDuration)}

      {/* Scene 3: Social Proof (optional) */}
      {metric && metricLabel && (
        <>
          <Sequence from={currentFrame} durationInFrames={socialDuration}>
            <SocialProofScene metric={metric} label={metricLabel} />
          </Sequence>
          {(currentFrame += socialDuration)}
        </>
      )}

      {/* Scene 4: CTA */}
      <Sequence from={currentFrame}>
        <CTAScene
          ctaText={ctaText}
          subtext={ctaSubtext}
          accentColor={accentColor}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Default Props

```tsx
const defaultProps: MarketingPromoProps = {
  headline: 'Introducing Something Amazing',
  valuePoints: [
    { icon: '🚀', text: 'Lightning Fast Performance' },
    { icon: '🔒', text: 'Enterprise-Grade Security' },
    { icon: '💡', text: 'AI-Powered Insights' },
  ],
  metric: '50,000+',
  metricLabel: 'Happy Customers',
  ctaText: 'Get Started Free',
  ctaSubtext: 'No credit card required',
  accentColor: '#3B82F6',
  duration: 30,
};
```

## Variations

### Sale Announcement
```tsx
const saleProps = {
  headline: '🔥 BLACK FRIDAY SALE 🔥',
  valuePoints: [
    { icon: '💰', text: 'Up to 70% OFF Everything' },
    { icon: '⏰', text: 'Limited Time Only' },
    { icon: '🚚', text: 'Free Express Shipping' },
  ],
  ctaText: 'SHOP NOW',
  ctaSubtext: 'Ends Monday at Midnight',
  accentColor: '#EF4444',
  duration: 20,
};
```

### Product Launch
```tsx
const launchProps = {
  headline: 'The Future is Here',
  valuePoints: [
    { icon: '✨', text: 'Revolutionary Design' },
    { icon: '⚡', text: '10x Faster Than Before' },
    { icon: '🌍', text: 'Available Worldwide' },
  ],
  metric: 'Starting at $99',
  metricLabel: 'Pre-order Now',
  ctaText: 'Reserve Yours',
  accentColor: '#8B5CF6',
  duration: 45,
};
```

## Color Palettes

| Mood | Primary | Accent | Background |
|------|---------|--------|------------|
| Trust/Tech | #3B82F6 | #60A5FA | #111827 |
| Urgency/Sale | #EF4444 | #FCA5A5 | #0F0F0F |
| Premium | #8B5CF6 | #A78BFA | #1F1F1F |
| Growth/Money | #10B981 | #34D399 | #064E3B |
| Energy | #F59E0B | #FBBF24 | #1C1917 |
| Modern | #EC4899 | #F472B6 | #18181B |

## Animation Tips

1. **Hook Scene**: Use impact animations (scale + shake)
2. **Value Props**: Stagger reveals (50-100ms between items)
3. **Numbers**: Always animate counters for engagement
4. **CTA**: Add subtle pulse to draw attention
5. **Transitions**: Use opacity fades between scenes
