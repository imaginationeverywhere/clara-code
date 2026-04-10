# Product Demo Template

**Type:** Product Demonstration
**Duration:** 30-120 seconds
**Formats:** Landscape (16:9) primary, Portrait (9:16) for mobile apps

## Use Cases

- App walkthroughs
- Feature highlights
- Tutorial videos
- Software demos
- SaaS product tours
- Mobile app showcases

## Scene Structure

### Scene 1: Problem Statement (5-10 seconds)
**Purpose:** Establish the pain point your product solves

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface ProblemSceneProps {
  problemText: string;
  subText?: string;
}

export const ProblemScene: React.FC<ProblemSceneProps> = ({ problemText, subText }) => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gray-900 p-16">
      <h2 className="text-video-lg text-gray-400 mb-4" style={{ opacity: textOpacity }}>
        😫 Sound familiar?
      </h2>
      <h1
        className="text-video-xl font-bold text-white text-center max-w-4xl"
        style={{ opacity: textOpacity }}
      >
        {problemText}
      </h1>
      {subText && (
        <p
          className="text-video-base text-gray-400 mt-8 text-center"
          style={{ opacity: subOpacity }}
        >
          {subText}
        </p>
      )}
    </AbsoluteFill>
  );
};
```

### Scene 2: Solution Introduction (3-5 seconds)
**Purpose:** Introduce your product as the solution

```tsx
interface SolutionIntroProps {
  productName: string;
  tagline: string;
  logoUrl?: string;
  accentColor?: string;
}

export const SolutionIntro: React.FC<SolutionIntroProps> = ({
  productName,
  tagline,
  logoUrl,
  accentColor = '#3B82F6',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 10, stiffness: 100 } });

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${accentColor}20 0%, #111827 100%)`,
      }}
    >
      <span className="text-video-lg text-gray-300 mb-4">Introducing</span>

      {logoUrl ? (
        <Img
          src={logoUrl}
          className="h-32 mb-6"
          style={{ transform: `scale(${scale})` }}
        />
      ) : (
        <h1
          className="text-video-2xl font-black text-white"
          style={{ transform: `scale(${scale})` }}
        >
          {productName}
        </h1>
      )}

      <p className="text-video-lg text-gray-400">{tagline}</p>
    </AbsoluteFill>
  );
};
```

### Scene 3: Feature Demo (Main Content)
**Purpose:** Show the product in action

#### Desktop App Mockup
```tsx
interface DesktopMockupProps {
  screenshotUrl: string;
  highlightAreas?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    delay: number;
  }>;
}

export const DesktopMockup: React.FC<DesktopMockupProps> = ({
  screenshotUrl,
  highlightAreas = [],
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill className="flex items-center justify-center bg-gray-900 p-16">
      {/* Browser window frame */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl overflow-hidden w-[80%]">
        {/* Browser toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 mx-4 bg-gray-600 rounded px-4 py-1 text-gray-300 text-sm">
            https://yourproduct.com
          </div>
        </div>

        {/* Screenshot */}
        <div className="relative">
          <Img src={screenshotUrl} className="w-full" />

          {/* Highlight overlays */}
          {highlightAreas.map((area, index) => {
            const areaFrame = Math.max(0, frame - area.delay);
            const opacity = interpolate(areaFrame, [0, 15], [0, 1], {
              extrapolateRight: 'clamp',
            });
            const pulseScale = 1 + Math.sin(areaFrame * 0.1) * 0.02;

            return (
              <div
                key={index}
                className="absolute border-4 border-blue-500 rounded-lg"
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.width}%`,
                  height: `${area.height}%`,
                  opacity,
                  transform: `scale(${pulseScale})`,
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                }}
              >
                {/* Label */}
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap"
                >
                  {area.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

#### Mobile App Mockup
```tsx
interface PhoneMockupProps {
  screenshotUrl: string;
  phoneColor?: 'black' | 'white' | 'silver';
  showNotch?: boolean;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  screenshotUrl,
  phoneColor = 'black',
  showNotch = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({ frame, fps, config: { damping: 15 } });

  const frameColors = {
    black: 'bg-gray-900',
    white: 'bg-gray-100',
    silver: 'bg-gray-300',
  };

  return (
    <AbsoluteFill className="flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      <div
        className={`relative ${frameColors[phoneColor]} rounded-[3rem] p-3 shadow-2xl`}
        style={{
          transform: `translateY(${(1 - slideIn) * 100}px)`,
          opacity: slideIn,
        }}
      >
        {/* Phone screen */}
        <div className="relative bg-black rounded-[2.5rem] overflow-hidden">
          {/* Notch */}
          {showNotch && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-8 bg-black rounded-b-2xl z-10" />
          )}

          {/* Screenshot */}
          <Img
            src={screenshotUrl}
            className="w-[300px] h-[650px] object-cover"
          />
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gray-600 rounded-full" />
      </div>
    </AbsoluteFill>
  );
};
```

#### Feature Highlight Sequence
```tsx
interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  screenshotUrl?: string;
}

interface FeatureSequenceProps {
  features: FeatureItem[];
  framesPerFeature?: number;
}

export const FeatureSequence: React.FC<FeatureSequenceProps> = ({
  features,
  framesPerFeature = 120, // 4 seconds each
}) => {
  const frame = useCurrentFrame();

  // Determine which feature to show
  const currentFeatureIndex = Math.floor(frame / framesPerFeature);
  const featureFrame = frame % framesPerFeature;

  if (currentFeatureIndex >= features.length) return null;

  const feature = features[currentFeatureIndex];

  // Animations
  const enterOpacity = interpolate(featureFrame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(
    featureFrame,
    [framesPerFeature - 20, framesPerFeature],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = Math.min(enterOpacity, exitOpacity);

  return (
    <AbsoluteFill
      className="flex items-center bg-gray-900"
      style={{ opacity }}
    >
      {/* Left: Feature info */}
      <div className="w-1/2 p-16 flex flex-col justify-center">
        <span className="text-6xl mb-6">{feature.icon}</span>
        <h2 className="text-video-xl font-bold text-white mb-4">
          {feature.title}
        </h2>
        <p className="text-video-base text-gray-400">
          {feature.description}
        </p>
      </div>

      {/* Right: Screenshot */}
      <div className="w-1/2 p-8">
        {feature.screenshotUrl && (
          <Img
            src={feature.screenshotUrl}
            className="rounded-lg shadow-2xl"
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
```

### Scene 4: Benefits/Results (5-10 seconds)
**Purpose:** Show outcomes and benefits

```tsx
interface BenefitsSceneProps {
  benefits: Array<{ metric: string; label: string }>;
}

export const BenefitsScene: React.FC<BenefitsSceneProps> = ({ benefits }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill className="flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 gap-16">
      {benefits.map((benefit, index) => {
        const delay = index * 30;
        const benefitFrame = Math.max(0, frame - delay);
        const scale = spring({
          frame: benefitFrame,
          fps: 30,
          config: { damping: 12 },
        });

        // Animate number if it contains digits
        const numMatch = benefit.metric.match(/(\d+)/);
        let displayMetric = benefit.metric;
        if (numMatch) {
          const targetNum = parseInt(numMatch[1]);
          const animatedNum = Math.min(
            targetNum,
            Math.round(targetNum * (benefitFrame / 45))
          );
          displayMetric = benefit.metric.replace(numMatch[1], animatedNum.toString());
        }

        return (
          <div
            key={index}
            className="text-center"
            style={{ transform: `scale(${scale})` }}
          >
            <span className="text-video-2xl font-black text-white block">
              {displayMetric}
            </span>
            <span className="text-video-base text-gray-300">{benefit.label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

### Scene 5: Call to Action (5 seconds)
```tsx
interface DemoCTAProps {
  headline: string;
  ctaText: string;
  ctaUrl?: string;
  secondaryCta?: string;
}

export const DemoCTA: React.FC<DemoCTAProps> = ({
  headline,
  ctaText,
  ctaUrl,
  secondaryCta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const buttonScale = spring({ frame, fps, config: { damping: 10 } });
  const pulse = 1 + Math.sin(frame * 0.15) * 0.03;

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-video-xl font-bold text-white text-center mb-12">
        {headline}
      </h1>

      <div
        className="bg-blue-600 hover:bg-blue-700 px-16 py-6 rounded-full text-video-lg font-bold text-white"
        style={{
          transform: `scale(${buttonScale * pulse})`,
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)',
        }}
      >
        {ctaText}
      </div>

      {ctaUrl && (
        <span className="text-video-base text-gray-400 mt-8">{ctaUrl}</span>
      )}

      {secondaryCta && (
        <span className="text-video-sm text-gray-500 mt-4">{secondaryCta}</span>
      )}
    </AbsoluteFill>
  );
};
```

## Complete Product Demo Composition

```tsx
import { AbsoluteFill, Sequence } from 'remotion';

interface ProductDemoProps {
  problemStatement: string;
  productName: string;
  tagline: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
    screenshotUrl?: string;
  }>;
  benefits: Array<{ metric: string; label: string }>;
  ctaHeadline: string;
  ctaText: string;
  accentColor?: string;
}

export const ProductDemo: React.FC<ProductDemoProps> = ({
  problemStatement,
  productName,
  tagline,
  features,
  benefits,
  ctaHeadline,
  ctaText,
  accentColor = '#3B82F6',
}) => {
  // Scene timing (in frames at 30fps)
  const problemDuration = 150;    // 5 seconds
  const introDuration = 120;      // 4 seconds
  const featureDuration = features.length * 120; // 4 seconds each
  const benefitsDuration = 150;   // 5 seconds
  const ctaDuration = 150;        // 5 seconds

  let currentFrame = 0;

  return (
    <AbsoluteFill>
      {/* Scene 1: Problem */}
      <Sequence from={currentFrame} durationInFrames={problemDuration}>
        <ProblemScene problemText={problemStatement} />
      </Sequence>
      {(currentFrame += problemDuration)}

      {/* Scene 2: Solution Intro */}
      <Sequence from={currentFrame} durationInFrames={introDuration}>
        <SolutionIntro
          productName={productName}
          tagline={tagline}
          accentColor={accentColor}
        />
      </Sequence>
      {(currentFrame += introDuration)}

      {/* Scene 3: Features */}
      <Sequence from={currentFrame} durationInFrames={featureDuration}>
        <FeatureSequence features={features} />
      </Sequence>
      {(currentFrame += featureDuration)}

      {/* Scene 4: Benefits */}
      <Sequence from={currentFrame} durationInFrames={benefitsDuration}>
        <BenefitsScene benefits={benefits} />
      </Sequence>
      {(currentFrame += benefitsDuration)}

      {/* Scene 5: CTA */}
      <Sequence from={currentFrame} durationInFrames={ctaDuration}>
        <DemoCTA headline={ctaHeadline} ctaText={ctaText} />
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Default Props Example

```tsx
const defaultProps: ProductDemoProps = {
  problemStatement: "Spending hours on tasks that should take minutes?",
  productName: "TaskFlow",
  tagline: "Automate your workflow in seconds",
  features: [
    {
      title: "Smart Automation",
      description: "Set up workflows with drag-and-drop simplicity. No coding required.",
      icon: "⚡",
      screenshotUrl: "/screenshots/automation.png",
    },
    {
      title: "Team Collaboration",
      description: "Work together in real-time with built-in comments and approvals.",
      icon: "👥",
      screenshotUrl: "/screenshots/collaboration.png",
    },
    {
      title: "Analytics Dashboard",
      description: "Track performance and optimize your processes with data insights.",
      icon: "📊",
      screenshotUrl: "/screenshots/analytics.png",
    },
  ],
  benefits: [
    { metric: "10x", label: "Faster workflows" },
    { metric: "50%", label: "Time saved" },
    { metric: "99.9%", label: "Uptime" },
  ],
  ctaHeadline: "Ready to transform your workflow?",
  ctaText: "Start Free Trial",
  accentColor: "#3B82F6",
};
```

## Cursor Animation (for Walkthroughs)

```tsx
interface CursorAnimationProps {
  path: Array<{ x: number; y: number; action?: 'click' | 'hover' }>;
  startFrame?: number;
}

export const CursorAnimation: React.FC<CursorAnimationProps> = ({
  path,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - startFrame;

  if (adjustedFrame < 0) return null;

  // Calculate current position along path
  const framesPerPoint = 30;
  const currentIndex = Math.floor(adjustedFrame / framesPerPoint);
  const progress = (adjustedFrame % framesPerPoint) / framesPerPoint;

  if (currentIndex >= path.length - 1) {
    const lastPoint = path[path.length - 1];
    return <CursorIcon x={lastPoint.x} y={lastPoint.y} />;
  }

  const current = path[currentIndex];
  const next = path[currentIndex + 1];

  // Interpolate position
  const x = current.x + (next.x - current.x) * progress;
  const y = current.y + (next.y - current.y) * progress;

  // Click ripple effect
  const showClick = next.action === 'click' && progress > 0.9;

  return (
    <>
      <CursorIcon x={x} y={y} />
      {showClick && <ClickRipple x={next.x} y={next.y} />}
    </>
  );
};

const CursorIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div
    className="absolute w-6 h-6 pointer-events-none z-50"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <svg viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1">
      <path d="M5.5 3.21V20.8l4.5-4.5h8L5.5 3.21z" />
    </svg>
  </div>
);

const ClickRipple: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const scale = 1 + frame * 0.1;
  const opacity = Math.max(0, 1 - frame * 0.05);

  return (
    <div
      className="absolute w-8 h-8 border-2 border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    />
  );
};
```
