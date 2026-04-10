# Creative & Entertainment Template

**Type:** Creative Productions
**Duration:** Variable (30 seconds - 5+ minutes)
**Formats:** All formats supported

## Use Cases

- Lyric videos
- Music visualizers
- Animated stories
- Title sequences
- Trailers/teasers
- Artistic expressions
- Kinetic typography
- Audio-reactive visuals

## Lyric Video Components

### Synchronized Lyrics Display
```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface LyricLine {
  text: string;
  startFrame: number;
  endFrame: number;
  style?: 'fade' | 'slide' | 'scale' | 'typewriter' | 'karaoke';
}

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  fontFamily?: string;
  primaryColor?: string;
  highlightColor?: string;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  fontFamily = 'Inter',
  primaryColor = '#FFFFFF',
  highlightColor = '#3B82F6',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find current lyric
  const currentLyric = lyrics.find(
    (l) => frame >= l.startFrame && frame <= l.endFrame
  );

  if (!currentLyric) return null;

  const lyricFrame = frame - currentLyric.startFrame;
  const duration = currentLyric.endFrame - currentLyric.startFrame;

  // Animation styles
  const getAnimation = () => {
    switch (currentLyric.style || 'fade') {
      case 'fade':
        return {
          opacity: interpolate(
            lyricFrame,
            [0, 15, duration - 15, duration],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          ),
        };

      case 'slide':
        return {
          opacity: interpolate(lyricFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(
            lyricFrame,
            [0, 20],
            [50, 0],
            { extrapolateRight: 'clamp' }
          )}px)`,
        };

      case 'scale':
        const scale = spring({ frame: lyricFrame, fps, config: { damping: 10, stiffness: 100 } });
        return {
          transform: `scale(${scale})`,
          opacity: interpolate(lyricFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        };

      case 'typewriter':
        const charsToShow = Math.floor((lyricFrame / duration) * currentLyric.text.length * 1.5);
        return {
          content: currentLyric.text.substring(0, Math.min(charsToShow, currentLyric.text.length)),
        };

      case 'karaoke':
        const progress = lyricFrame / duration;
        return {
          background: `linear-gradient(90deg, ${highlightColor} ${progress * 100}%, ${primaryColor} ${progress * 100}%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        };

      default:
        return {};
    }
  };

  const animation = getAnimation();
  const displayText = animation.content || currentLyric.text;

  return (
    <AbsoluteFill className="flex items-center justify-center p-16">
      <h1
        className="text-video-xl font-bold text-center leading-relaxed"
        style={{
          fontFamily,
          color: currentLyric.style === 'karaoke' ? undefined : primaryColor,
          ...animation,
        }}
      >
        {displayText}
      </h1>
    </AbsoluteFill>
  );
};
```

### Audio Visualizer
```tsx
interface AudioVisualizerProps {
  audioFile: string;
  style?: 'bars' | 'waveform' | 'circle' | 'particles';
  color?: string;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioFile,
  style = 'bars',
  color = '#3B82F6',
  barCount = 64,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Simulate audio data (in real implementation, use @remotion/media-utils)
  // This creates a fake visualization for demonstration
  const generateBars = () => {
    const bars = [];
    for (let i = 0; i < barCount; i++) {
      // Create pseudo-random but deterministic values based on frame
      const seed = Math.sin(frame * 0.1 + i * 0.5) * 0.5 + 0.5;
      const heightPercent = 20 + seed * 60 + Math.sin(frame * 0.2 + i * 0.3) * 20;
      bars.push(heightPercent);
    }
    return bars;
  };

  const bars = generateBars();

  if (style === 'bars') {
    return (
      <AbsoluteFill className="flex items-end justify-center gap-1 pb-32">
        {bars.map((barHeight, i) => (
          <div
            key={i}
            className="rounded-t"
            style={{
              width: `${(width * 0.8) / barCount}px`,
              height: `${barHeight}%`,
              backgroundColor: color,
              opacity: 0.8 + (barHeight / 100) * 0.2,
            }}
          />
        ))}
      </AbsoluteFill>
    );
  }

  if (style === 'circle') {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.25;

    return (
      <AbsoluteFill>
        <svg width={width} height={height}>
          {bars.map((barHeight, i) => {
            const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
            const innerRadius = baseRadius;
            const outerRadius = baseRadius + (barHeight / 100) * 150;

            const x1 = centerX + Math.cos(angle) * innerRadius;
            const y1 = centerY + Math.sin(angle) * innerRadius;
            const x2 = centerX + Math.cos(angle) * outerRadius;
            const y2 = centerY + Math.sin(angle) * outerRadius;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                opacity={0.7 + (barHeight / 100) * 0.3}
              />
            );
          })}
        </svg>
      </AbsoluteFill>
    );
  }

  if (style === 'waveform') {
    const points = bars.map((barHeight, i) => {
      const x = (i / (barCount - 1)) * width;
      const y = height / 2 + (barHeight - 50) * 3;
      return `${x},${y}`;
    }).join(' ');

    return (
      <AbsoluteFill>
        <svg width={width} height={height}>
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </AbsoluteFill>
    );
  }

  return null;
};
```

### Kinetic Typography
```tsx
interface Word {
  text: string;
  startFrame: number;
  x?: number; // percentage
  y?: number; // percentage
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rotation?: number;
  animation?: 'pop' | 'slide' | 'spin' | 'shake' | 'bounce';
}

interface KineticTypographyProps {
  words: Word[];
  fontFamily?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  words,
  fontFamily = 'Inter',
  primaryColor = '#FFFFFF',
  secondaryColor = '#3B82F6',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-video-xl',
    xl: 'text-video-2xl',
  };

  return (
    <AbsoluteFill className="relative">
      {words.map((word, index) => {
        if (frame < word.startFrame) return null;

        const wordFrame = frame - word.startFrame;
        let transform = '';
        let opacity = 1;

        // Animations
        switch (word.animation) {
          case 'pop':
            const scale = spring({ frame: wordFrame, fps, config: { damping: 8, stiffness: 200 } });
            transform = `scale(${scale})`;
            opacity = Math.min(1, wordFrame / 5);
            break;

          case 'slide':
            transform = `translateX(${Math.max(0, 100 - wordFrame * 5)}px)`;
            opacity = Math.min(1, wordFrame / 10);
            break;

          case 'spin':
            const spinScale = spring({ frame: wordFrame, fps });
            transform = `rotate(${interpolate(wordFrame, [0, 20], [180, word.rotation || 0], { extrapolateRight: 'clamp' })}deg) scale(${spinScale})`;
            break;

          case 'shake':
            const shakeX = wordFrame < 30 ? Math.sin(wordFrame * 1.5) * 10 : 0;
            const shakeY = wordFrame < 30 ? Math.cos(wordFrame * 1.5) * 5 : 0;
            transform = `translate(${shakeX}px, ${shakeY}px)`;
            break;

          case 'bounce':
            const bounceY = spring({
              frame: wordFrame,
              fps,
              config: { damping: 5, stiffness: 150 },
            });
            transform = `translateY(${(1 - bounceY) * -100}px)`;
            break;

          default:
            opacity = Math.min(1, wordFrame / 15);
        }

        return (
          <div
            key={index}
            className={`absolute ${sizeClasses[word.size || 'lg']} font-black`}
            style={{
              left: `${word.x || 50}%`,
              top: `${word.y || 50}%`,
              transform: `translate(-50%, -50%) ${transform} rotate(${word.rotation || 0}deg)`,
              opacity,
              fontFamily,
              color: index % 2 === 0 ? primaryColor : secondaryColor,
              textShadow: '4px 4px 8px rgba(0,0,0,0.5)',
            }}
          >
            {word.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

## Title Sequence Components

### Cinematic Title
```tsx
interface CinematicTitleProps {
  title: string;
  subtitle?: string;
  style?: 'fade' | 'reveal' | 'glitch' | 'typewriter';
}

export const CinematicTitle: React.FC<CinematicTitleProps> = ({
  title,
  subtitle,
  style = 'reveal',
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const renderTitle = () => {
    switch (style) {
      case 'reveal':
        // Mask reveal from center
        const revealWidth = interpolate(frame, [0, 45], [0, 100], { extrapolateRight: 'clamp' });
        return (
          <h1
            className="text-video-2xl font-black text-white tracking-widest uppercase"
            style={{
              clipPath: `inset(0 ${50 - revealWidth / 2}% 0 ${50 - revealWidth / 2}%)`,
            }}
          >
            {title}
          </h1>
        );

      case 'glitch':
        // Glitch effect
        const glitchOffset = frame % 60 < 5 ? Math.random() * 10 - 5 : 0;
        const redOffset = frame % 45 < 3 ? 3 : 0;
        return (
          <div className="relative">
            {/* Red channel */}
            <h1
              className="text-video-2xl font-black text-red-500 tracking-widest uppercase absolute"
              style={{
                left: redOffset,
                mixBlendMode: 'screen',
                opacity: 0.8,
              }}
            >
              {title}
            </h1>
            {/* Cyan channel */}
            <h1
              className="text-video-2xl font-black text-cyan-500 tracking-widest uppercase absolute"
              style={{
                left: -redOffset,
                mixBlendMode: 'screen',
                opacity: 0.8,
              }}
            >
              {title}
            </h1>
            {/* Main */}
            <h1
              className="text-video-2xl font-black text-white tracking-widest uppercase"
              style={{ transform: `translateX(${glitchOffset}px)` }}
            >
              {title}
            </h1>
          </div>
        );

      case 'typewriter':
        const charsToShow = Math.floor(frame / 3);
        const showCursor = frame % 30 < 15;
        return (
          <h1 className="text-video-2xl font-mono text-white">
            {title.substring(0, charsToShow)}
            {showCursor && <span className="animate-pulse">|</span>}
          </h1>
        );

      default: // fade
        const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
        return (
          <h1
            className="text-video-2xl font-black text-white tracking-widest uppercase"
            style={{ opacity }}
          >
            {title}
          </h1>
        );
    }
  };

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-black">
      {renderTitle()}

      {subtitle && (
        <p
          className="text-video-lg text-gray-400 mt-8 tracking-wider"
          style={{
            opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Cinematic bars */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-black" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-black" />
    </AbsoluteFill>
  );
};
```

### Animated Logo Reveal
```tsx
interface LogoRevealProps {
  logoUrl: string;
  companyName?: string;
  style?: 'scale' | 'draw' | 'particles' | 'shine';
  backgroundColor?: string;
}

export const LogoReveal: React.FC<LogoRevealProps> = ({
  logoUrl,
  companyName,
  style = 'scale',
  backgroundColor = '#000000',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const getLogoAnimation = () => {
    switch (style) {
      case 'scale':
        const scale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
        return {
          transform: `scale(${scale})`,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
        };

      case 'shine':
        const shinePosition = interpolate(frame, [30, 60], [-100, 200], { extrapolateRight: 'clamp' });
        return {
          transform: `scale(${spring({ frame, fps })})`,
          filter: `drop-shadow(${shinePosition}px 0 20px rgba(255,255,255,0.5))`,
        };

      default:
        return {};
    }
  };

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center"
      style={{ backgroundColor }}
    >
      <Img
        src={logoUrl}
        className="w-64 h-64 object-contain"
        style={getLogoAnimation()}
      />

      {companyName && (
        <h2
          className="text-video-lg text-white font-light tracking-[0.3em] uppercase mt-12"
          style={{
            opacity: interpolate(frame, [45, 65], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {companyName}
        </h2>
      )}
    </AbsoluteFill>
  );
};
```

## Complete Lyric Video Composition

```tsx
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';

interface LyricVideoProps {
  songTitle: string;
  artistName: string;
  audioFile: string;
  lyrics: Array<{
    text: string;
    startTime: number; // in seconds
    endTime: number;
    style?: 'fade' | 'slide' | 'scale' | 'typewriter' | 'karaoke';
  }>;
  visualizerStyle?: 'bars' | 'circle' | 'waveform';
  primaryColor?: string;
  backgroundColor?: string;
  fps?: number;
}

export const LyricVideo: React.FC<LyricVideoProps> = ({
  songTitle,
  artistName,
  audioFile,
  lyrics,
  visualizerStyle = 'bars',
  primaryColor = '#3B82F6',
  backgroundColor = '#111827',
  fps = 30,
}) => {
  // Convert time-based lyrics to frame-based
  const frameLyrics = lyrics.map((l) => ({
    text: l.text,
    startFrame: Math.round(l.startTime * fps),
    endFrame: Math.round(l.endTime * fps),
    style: l.style,
  }));

  const introDuration = 3 * fps; // 3 seconds
  const lastLyric = frameLyrics[frameLyrics.length - 1];
  const outroDuration = 3 * fps;
  const totalDuration = lastLyric.endFrame + outroDuration;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Audio */}
      <Audio src={staticFile(audioFile)} />

      {/* Intro */}
      <Sequence from={0} durationInFrames={introDuration}>
        <AbsoluteFill className="flex flex-col items-center justify-center">
          <h1 className="text-video-xl font-bold text-white">{songTitle}</h1>
          <p className="text-video-lg text-gray-400 mt-4">{artistName}</p>
        </AbsoluteFill>
      </Sequence>

      {/* Background visualizer */}
      <Sequence from={introDuration}>
        <div className="absolute inset-0 opacity-30">
          <AudioVisualizer
            audioFile={audioFile}
            style={visualizerStyle}
            color={primaryColor}
          />
        </div>
      </Sequence>

      {/* Lyrics */}
      <Sequence from={introDuration}>
        <LyricsDisplay
          lyrics={frameLyrics}
          primaryColor="#FFFFFF"
          highlightColor={primaryColor}
        />
      </Sequence>

      {/* Outro */}
      <Sequence from={lastLyric.endFrame}>
        <AbsoluteFill className="flex flex-col items-center justify-center">
          <h2 className="text-video-lg text-gray-300">{songTitle}</h2>
          <p className="text-video-base text-gray-500 mt-2">by {artistName}</p>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Registration Example

```tsx
// In Root.tsx
<Composition
  id="LyricVideo"
  component={LyricVideo}
  durationInFrames={6000} // ~3.5 minutes at 30fps
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    songTitle: "Dream On",
    artistName: "Artist Name",
    audioFile: "song.mp3",
    lyrics: [
      { text: "Every time I close my eyes", startTime: 5, endTime: 8, style: 'fade' },
      { text: "I see a world that's meant for me", startTime: 8.5, endTime: 12, style: 'slide' },
      { text: "Where all my dreams come alive", startTime: 12.5, endTime: 16, style: 'karaoke' },
      // ... more lyrics
    ],
    visualizerStyle: 'circle',
    primaryColor: '#8B5CF6',
    backgroundColor: '#0F0F1A',
  }}
/>
```

## Particle System (Advanced)

```tsx
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
}

interface ParticleSystemProps {
  particleCount?: number;
  colors?: string[];
  style?: 'float' | 'explode' | 'rain' | 'confetti';
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 100,
  colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
  style = 'float',
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate particles (deterministic based on index)
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const seed = i * 0.1;
      return {
        x: Math.sin(seed * 100) * width,
        y: Math.cos(seed * 100) * height,
        vx: Math.sin(seed * 50) * 2,
        vy: Math.cos(seed * 50) * 2 - 1,
        size: 3 + Math.sin(seed * 30) * 5,
        life: 100 + Math.sin(seed * 20) * 50,
        color: colors[i % colors.length],
      };
    });
  }, [particleCount, width, height, colors]);

  return (
    <AbsoluteFill>
      {particles.map((particle, i) => {
        let x = particle.x;
        let y = particle.y;
        let opacity = 1;

        switch (style) {
          case 'float':
            x += Math.sin(frame * 0.02 + i) * 50 + particle.vx * frame * 0.5;
            y += Math.cos(frame * 0.02 + i) * 30 + particle.vy * frame * 0.3;
            opacity = 0.3 + Math.sin(frame * 0.05 + i) * 0.3;
            break;

          case 'rain':
            y = (particle.y + frame * 5 + i * 10) % (height + 50) - 50;
            x = particle.x + Math.sin(frame * 0.1 + i) * 5;
            opacity = 0.5;
            break;

          case 'confetti':
            const confettiFrame = (frame + i * 3) % 150;
            x = particle.x + Math.sin(confettiFrame * 0.1) * 100;
            y = particle.y + confettiFrame * 8;
            opacity = 1 - confettiFrame / 150;
            break;
        }

        // Wrap around screen
        x = ((x % width) + width) % width;
        y = ((y % height) + height) % height;

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: x,
              top: y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity,
              transform: style === 'confetti' ? `rotate(${frame * 5 + i * 30}deg)` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
```

## Tips for Creative Videos

### Audio Sync
1. Get exact BPM of your music
2. Calculate frames per beat: `fps * 60 / BPM`
3. Align visual beats to audio beats
4. Use markers for drops, choruses, etc.

### Visual Rhythm
- Cut on downbeats for impact
- Use subtle motion on upbeats
- Build intensity toward drops
- Let quiet sections breathe

### Color Theory
- Match mood to color temperature
- Use complementary colors for contrast
- Gradients add depth and interest
- Limit palette to 3-5 colors

### Typography
- Match font to music genre
- Sans-serif = modern, clean
- Serif = elegant, classic
- Script = emotional, personal
- Display = bold, impactful
