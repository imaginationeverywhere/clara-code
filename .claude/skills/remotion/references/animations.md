# Remotion Animation Reference

Quick reference for animation patterns and timing functions.

## Core Animation Functions

### interpolate
Linear interpolation between values.
```tsx
import { interpolate } from 'remotion';

const opacity = interpolate(
  frame,              // Current frame
  [0, 30],            // Input range (frames)
  [0, 1],             // Output range
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }
);
```

### spring
Physics-based animation.
```tsx
import { spring, useVideoConfig } from 'remotion';

const { fps } = useVideoConfig();

const scale = spring({
  frame,
  fps,
  config: {
    damping: 10,      // Higher = less bounce (default: 10)
    stiffness: 100,   // Higher = faster (default: 100)
    mass: 1,          // Higher = more inertia (default: 1)
  },
});
```

### Easing
Pre-built easing functions.
```tsx
import { Easing, interpolate } from 'remotion';

const value = interpolate(frame, [0, 30], [0, 100], {
  easing: Easing.ease,  // Default ease
});

// Available easings
Easing.linear      // No easing
Easing.ease        // Standard ease
Easing.in(fn)      // Ease in only
Easing.out(fn)     // Ease out only
Easing.inOut(fn)   // Ease in and out
Easing.bounce      // Bounce effect
Easing.elastic(1)  // Elastic effect
Easing.bezier(0.25, 0.1, 0.25, 1)  // Custom bezier
```

## Spring Presets

### Gentle (smooth, slow)
```tsx
config: { damping: 20, stiffness: 80, mass: 1 }
```

### Default (balanced)
```tsx
config: { damping: 10, stiffness: 100, mass: 1 }
```

### Snappy (quick, responsive)
```tsx
config: { damping: 15, stiffness: 200, mass: 0.5 }
```

### Bouncy (playful)
```tsx
config: { damping: 5, stiffness: 150, mass: 0.5 }
```

### Heavy (dramatic)
```tsx
config: { damping: 30, stiffness: 50, mass: 2 }
```

## Common Animation Patterns

### Fade In
```tsx
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateRight: 'clamp',
});

<div style={{ opacity }}>Content</div>
```

### Fade Out
```tsx
const opacity = interpolate(frame, [duration - 20, duration], [1, 0], {
  extrapolateLeft: 'clamp',
});
```

### Slide In (from right)
```tsx
const translateX = interpolate(frame, [0, 25], [100, 0], {
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.ease),
});

<div style={{ transform: `translateX(${translateX}px)` }}>Content</div>
```

### Slide In (from bottom)
```tsx
const translateY = interpolate(frame, [0, 25], [50, 0], {
  extrapolateRight: 'clamp',
});

<div style={{ transform: `translateY(${translateY}px)` }}>Content</div>
```

### Scale In (with spring)
```tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 10, stiffness: 150 },
});

<div style={{ transform: `scale(${scale})` }}>Content</div>
```

### Scale In (with overshoot)
```tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 6, stiffness: 200 },
});
// Will overshoot 1 before settling
```

### Rotate In
```tsx
const rotation = interpolate(frame, [0, 30], [180, 0], {
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.ease),
});

<div style={{ transform: `rotate(${rotation}deg)` }}>Content</div>
```

### Combined (Slide + Fade)
```tsx
const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
const translateY = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: 'clamp' });

<div style={{ opacity, transform: `translateY(${translateY}px)` }}>Content</div>
```

### Staggered Reveal
```tsx
const items = ['A', 'B', 'C', 'D'];

{items.map((item, index) => {
  const delay = index * 10; // 10 frames between each
  const itemFrame = Math.max(0, frame - delay);

  const opacity = interpolate(itemFrame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div key={index} style={{ opacity }}>
      {item}
    </div>
  );
})}
```

### Continuous Loop
```tsx
// Floating effect
const float = Math.sin(frame * 0.05) * 10;
<div style={{ transform: `translateY(${float}px)` }}>Float</div>

// Rotation loop
const rotation = (frame * 2) % 360;
<div style={{ transform: `rotate(${rotation}deg)` }}>Spin</div>

// Pulse effect
const scale = 1 + Math.sin(frame * 0.1) * 0.05;
<div style={{ transform: `scale(${scale})` }}>Pulse</div>
```

### Typewriter Effect
```tsx
const charsToShow = Math.floor(frame / 2); // 2 frames per character
const text = "Hello World".substring(0, charsToShow);

<span>{text}</span>
```

### Counter Animation
```tsx
const value = interpolate(frame, [0, 60], [0, 1000], {
  extrapolateRight: 'clamp',
});

<span>{Math.round(value).toLocaleString()}</span>
```

### Shake Effect
```tsx
const shakeIntensity = Math.max(0, 10 - frame * 0.5); // Decay over time
const shakeX = Math.sin(frame * 2) * shakeIntensity;
const shakeY = Math.cos(frame * 2) * shakeIntensity * 0.5;

<div style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>Shake</div>
```

### Bounce In
```tsx
const progress = spring({
  frame,
  fps,
  config: { damping: 5, stiffness: 200, mass: 0.5 },
});

// progress will overshoot 1 and bounce back
<div style={{ transform: `scale(${progress})` }}>Bounce</div>
```

### Elastic Entry
```tsx
const progress = spring({
  frame,
  fps,
  config: { damping: 4, stiffness: 150, mass: 0.3 },
});

<div style={{ transform: `translateX(${(1 - progress) * 200}px)` }}>Elastic</div>
```

## Sequence Timing

### Basic Sequence
```tsx
<Sequence from={0} durationInFrames={90}>
  <Scene1 />
</Sequence>

<Sequence from={90} durationInFrames={120}>
  <Scene2 />
</Sequence>

<Sequence from={210}>
  <Scene3 />
</Sequence>
```

### Overlapping Sequences (Crossfade)
```tsx
// Scene 1: 0-120 (fades out at end)
<Sequence from={0} durationInFrames={120}>
  <FadeOutScene duration={120}>
    <Scene1 />
  </FadeOutScene>
</Sequence>

// Scene 2: 100-220 (fades in at start, 20 frame overlap)
<Sequence from={100} durationInFrames={120}>
  <FadeInScene duration={120}>
    <Scene2 />
  </FadeInScene>
</Sequence>
```

## Timing Calculations

### Seconds to Frames
```tsx
const fps = 30;
const seconds = 5;
const frames = seconds * fps; // 150
```

### Frames to Seconds
```tsx
const fps = 30;
const frames = 150;
const seconds = frames / fps; // 5
```

### BPM to Frames per Beat
```tsx
const fps = 30;
const bpm = 120;
const framesPerBeat = (fps * 60) / bpm; // 15
```

### Delay Calculation
```tsx
// Start animation at 2 seconds
const delayFrames = 2 * fps;
const adjustedFrame = Math.max(0, frame - delayFrames);

const opacity = interpolate(adjustedFrame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
});
```

## Performance Tips

### Memoize Expensive Calculations
```tsx
import { useMemo } from 'react';

const animation = useMemo(() => {
  return interpolate(frame, [0, 30], [0, 100]);
}, [frame]);
```

### Avoid Creating Objects in Render
```tsx
// BAD - creates new object every frame
<div style={{ transform: `scale(${scale})` }} />

// GOOD - memoize style object
const style = useMemo(() => ({
  transform: `scale(${scale})`,
}), [scale]);

<div style={style} />
```

### Use CSS Transforms
```tsx
// GOOD - GPU accelerated
transform: 'translateX(100px)'
transform: 'scale(1.5)'
transform: 'rotate(45deg)'

// AVOID - triggers layout
left: '100px'
width: '150%'
```

## Debugging Animations

### Log Frame Values
```tsx
console.log(`Frame ${frame}: opacity=${opacity}, scale=${scale}`);
```

### Slow Motion Preview
In Remotion Studio, use the playback speed control to slow down and inspect animations frame by frame.

### Visual Markers
```tsx
// Add frame counter overlay during development
<div className="absolute top-4 right-4 text-white text-sm bg-black/50 px-2 py-1">
  Frame: {frame}
</div>
```
