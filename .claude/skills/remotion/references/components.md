# Remotion Component Library Reference

Quick reference for pre-built, reusable video components.

## Text Components

### AnimatedText
```tsx
<AnimatedText
  animation="fadeIn" | "slideUp" | "slideDown" | "scaleIn" | "typewriter"
  delay={0}
  className="text-4xl font-bold text-white"
>
  Your text here
</AnimatedText>
```

### WordByWord
Reveals text word by word with configurable timing.
```tsx
<WordByWord
  text="This text appears word by word"
  delayPerWord={10}
  animation="pop"
/>
```

### TypewriterText
Classic typewriter effect with cursor.
```tsx
<TypewriterText
  text="Typing animation..."
  speed={2} // frames per character
  showCursor={true}
  cursorChar="|"
/>
```

## Layout Components

### AbsoluteFill
Full-screen container (Remotion built-in).
```tsx
<AbsoluteFill className="flex items-center justify-center">
  {children}
</AbsoluteFill>
```

### SafeZone
Respects platform UI overlays.
```tsx
<SafeZone platform="tiktok" | "youtube" | "instagram">
  {children}
</SafeZone>
```

### SplitScreen
Two-column layout.
```tsx
<SplitScreen
  left={<LeftContent />}
  right={<RightContent />}
  ratio={50} // percentage for left side
  divider={true}
/>
```

## Background Components

### GradientBackground
```tsx
<GradientBackground
  from="#3B82F6"
  to="#8B5CF6"
  direction="to-br" | "to-r" | "to-b"
  animated={true}
/>
```

### ParticleBackground
Floating particles effect.
```tsx
<ParticleBackground
  count={50}
  colors={['#3B82F6', '#8B5CF6']}
  style="float" | "rain" | "confetti"
/>
```

### VideoBackground
Video as background with overlay.
```tsx
<VideoBackground
  src={staticFile('bg-video.mp4')}
  overlayColor="rgba(0,0,0,0.5)"
  blur={0}
/>
```

## Media Components

### PhoneMockup
Mobile device frame.
```tsx
<PhoneMockup
  screenshot={staticFile('app-screen.png')}
  color="black" | "white" | "silver"
  showNotch={true}
/>
```

### BrowserMockup
Desktop browser frame.
```tsx
<BrowserMockup
  screenshot={staticFile('website.png')}
  url="https://example.com"
/>
```

### ImageReveal
Animated image appearance.
```tsx
<ImageReveal
  src={staticFile('image.png')}
  animation="fadeIn" | "slideIn" | "zoomIn" | "wipe"
  delay={0}
/>
```

## Chart Components

### AnimatedCounter
Number animation.
```tsx
<AnimatedCounter
  from={0}
  to={10000}
  duration={60}
  format="number" | "currency" | "percent"
  prefix="$"
  suffix="+"
/>
```

### ProgressBar
Horizontal or vertical bar.
```tsx
<ProgressBar
  progress={0.75}
  color="#3B82F6"
  animated={true}
  showLabel={true}
/>
```

### BarChart
Animated bar chart.
```tsx
<BarChart
  data={[
    { label: 'Q1', value: 100 },
    { label: 'Q2', value: 150 },
  ]}
  orientation="horizontal" | "vertical"
  showValues={true}
/>
```

### PieChart
Pie or donut chart.
```tsx
<PieChart
  data={[
    { label: 'Category A', value: 40, color: '#3B82F6' },
    { label: 'Category B', value: 60, color: '#10B981' },
  ]}
  type="pie" | "donut"
  showLegend={true}
/>
```

## UI Components

### Button
Animated button element.
```tsx
<Button
  text="Click Me"
  variant="primary" | "secondary" | "outline"
  animation="pulse" | "bounce" | "none"
/>
```

### Badge
Status badge.
```tsx
<Badge
  text="NEW"
  color="#10B981"
  animation="fadeIn"
/>
```

### Card
Content card container.
```tsx
<Card
  title="Card Title"
  content="Card content here"
  image={staticFile('card-image.png')}
  animation="slideUp"
/>
```

## Transition Components

### FadeTransition
Crossfade between content.
```tsx
<FadeTransition durationInFrames={30}>
  <SceneA />
  <SceneB />
</FadeTransition>
```

### SlideTransition
Slide in/out.
```tsx
<SlideTransition
  direction="left" | "right" | "up" | "down"
  durationInFrames={20}
/>
```

### WipeTransition
Wipe reveal effect.
```tsx
<WipeTransition
  direction="horizontal" | "vertical" | "diagonal"
  color="#000000"
/>
```

## Audio Components

### AudioVisualizer
React to audio.
```tsx
<AudioVisualizer
  audioFile={staticFile('music.mp3')}
  style="bars" | "waveform" | "circle"
  color="#3B82F6"
/>
```

### VolumeControl
Animated volume.
```tsx
<Audio src={staticFile('audio.mp3')}>
  {(volume) => (
    <VolumeIndicator level={volume} />
  )}
</Audio>
```

## Utility Components

### Logo
Brand logo with animation.
```tsx
<Logo
  src={staticFile('logo.svg')}
  animation="scale" | "fade" | "shine"
  size="sm" | "md" | "lg"
/>
```

### SocialIcons
Social media icons.
```tsx
<SocialIcons
  platforms={['twitter', 'instagram', 'youtube']}
  animation="stagger"
  color="#FFFFFF"
/>
```

### QRCode
Animated QR code.
```tsx
<QRCode
  url="https://example.com"
  animation="fadeIn"
  size={200}
/>
```

## Component Props Reference

### Common Animation Props
```tsx
interface AnimationProps {
  delay?: number;        // Delay in frames
  duration?: number;     // Duration in frames
  easing?: EasingFunction;
}
```

### Common Style Props
```tsx
interface StyleProps {
  className?: string;    // Tailwind classes
  style?: React.CSSProperties;
  color?: string;
  backgroundColor?: string;
}
```

### Common Size Props
```tsx
interface SizeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: number | string;
  height?: number | string;
}
```
