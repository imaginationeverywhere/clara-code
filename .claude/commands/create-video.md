# Create Video

**Version:** 1.0.0
**Agent:** remotion-video-generator
**Output:** Remotion composition with rendered video file

## Purpose

Create professional videos from natural language descriptions. Supports marketing promos, social media content, product demos, data visualizations, and creative productions.

## Usage

```bash
# Basic usage with description
/create-video "30-second product announcement for our fitness app"

# Specify format
/create-video "TikTok showing our summer sale" --format=tiktok

# Specify output
/create-video "Company intro video" --output=videos/intro.mp4

# From script file
/create-video --script=scripts/product-launch.md

# Preview only (no render)
/create-video "Quick promo" --preview-only
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format` | Output format preset | `landscape-1080` |
| `--duration` | Video duration in seconds | Auto-determined |
| `--output` | Output file path | `out/{composition-id}.mp4` |
| `--codec` | Video codec (h264, vp9, prores, gif) | `h264` |
| `--quality` | Render quality (1-100) | `80` |
| `--preview-only` | Generate composition without rendering | `false` |
| `--script` | Path to video script file | - |
| `--style` | Visual style preset | Auto-determined |
| `--music` | Background music file path | - |

## Format Presets

| Preset | Dimensions | Aspect | Use Case |
|--------|------------|--------|----------|
| `landscape-1080` | 1920x1080 | 16:9 | YouTube, web |
| `landscape-720` | 1280x720 | 16:9 | Faster render |
| `landscape-4k` | 3840x2160 | 16:9 | High quality |
| `portrait-1080` | 1080x1920 | 9:16 | TikTok, Reels |
| `square` | 1080x1080 | 1:1 | Instagram |
| `tiktok` | 1080x1920 | 9:16 | TikTok optimized |
| `reels` | 1080x1920 | 9:16 | Instagram Reels |
| `shorts` | 1080x1920 | 9:16 | YouTube Shorts |
| `twitter` | 1280x720 | 16:9 | Twitter/X |
| `linkedin` | 1920x1080 | 16:9 | LinkedIn |

## Style Presets

| Style | Description | Best For |
|-------|-------------|----------|
| `modern` | Clean, minimal, blue/purple gradients | Tech, SaaS |
| `bold` | High contrast, large text, energetic | Sales, Promos |
| `corporate` | Professional, navy/gray, subtle | B2B, Enterprise |
| `playful` | Bright colors, bouncy animations | Consumer, Apps |
| `elegant` | Serif fonts, muted tones, refined | Luxury, Premium |
| `tech` | Dark mode, code aesthetic, neon accents | Developer tools |
| `minimal` | Black/white, typography-focused | Editorial, Art |
| `vibrant` | Multi-color, dynamic, youthful | Social, Lifestyle |

## Command Implementation

When this command is invoked, Claude Code should:

### Phase 1: Analyze Request

```markdown
📝 Analyzing Video Request...

**Input:** "30-second product announcement for our fitness app"

**Extracted Requirements:**
- Duration: 30 seconds (900 frames @ 30fps)
- Type: Product announcement
- Subject: Fitness app
- Tone: Energetic, motivational
- Format: Not specified → Default to landscape-1080
```

### Phase 2: Generate Scene Breakdown

```markdown
# Scene Breakdown: Fitness App Announcement

**Duration:** 30 seconds | **Format:** 1920x1080 | **FPS:** 30
**Style:** Vibrant, energetic with fitness-inspired colors

## Color Palette
- Primary: #10B981 (Energetic Green)
- Secondary: #3B82F6 (Active Blue)
- Accent: #F59E0B (Energy Orange)
- Background: #111827 (Dark Gray)
- Text: #FFFFFF (White)

## Scene 1: Hook (0:00 - 0:03)
- **Duration:** 3 seconds (90 frames)
- **Content:** Bold text "TRANSFORM YOUR FITNESS"
- **Animation:** Scale in with impact, shake effect
- **Background:** Gradient dark to green pulse

## Scene 2: Problem (0:03 - 0:08)
- **Duration:** 5 seconds (150 frames)
- **Content:** "Tired of complicated workout apps?"
- **Animation:** Text fade in, subtle slide
- **Visual:** Abstract fitness icons crossing out

## Scene 3: Solution (0:08 - 0:18)
- **Duration:** 10 seconds (300 frames)
- **Content:** App screenshots, key features
- **Animation:** Phone mockup slides in, features highlight
- **Features:**
  - "AI-Powered Workouts"
  - "Real-time Tracking"
  - "Personal Coaching"

## Scene 4: Social Proof (0:18 - 0:23)
- **Duration:** 5 seconds (150 frames)
- **Content:** "Join 100,000+ users"
- **Animation:** Counter animation, star ratings
- **Visual:** User avatars, testimonial snippet

## Scene 5: CTA (0:23 - 0:30)
- **Duration:** 7 seconds (210 frames)
- **Content:** "Download Free Today"
- **Animation:** Button pulse, app store badges
- **Visual:** QR code or download link

**Total:** 900 frames = 30 seconds
```

### Phase 3: Create Composition Structure

```bash
# Create composition directory
mkdir -p src/compositions/FitnessAppAnnouncement

# Files to create:
# - src/compositions/FitnessAppAnnouncement/index.tsx
# - src/compositions/FitnessAppAnnouncement/Scene1Hook.tsx
# - src/compositions/FitnessAppAnnouncement/Scene2Problem.tsx
# - src/compositions/FitnessAppAnnouncement/Scene3Solution.tsx
# - src/compositions/FitnessAppAnnouncement/Scene4SocialProof.tsx
# - src/compositions/FitnessAppAnnouncement/Scene5CTA.tsx
```

### Phase 4: Generate Components

#### Main Composition (index.tsx)
```tsx
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Scene1Hook } from './Scene1Hook';
import { Scene2Problem } from './Scene2Problem';
import { Scene3Solution } from './Scene3Solution';
import { Scene4SocialProof } from './Scene4SocialProof';
import { Scene5CTA } from './Scene5CTA';

export interface FitnessAppAnnouncementProps {
  appName: string;
  tagline: string;
  features: string[];
  userCount: number;
  ctaText: string;
  downloadUrl: string;
}

export const FitnessAppAnnouncement: React.FC<FitnessAppAnnouncementProps> = (props) => {
  return (
    <AbsoluteFill className="bg-gray-900">
      {/* Scene 1: Hook (0-90 frames, 0-3 sec) */}
      <Sequence from={0} durationInFrames={90}>
        <Scene1Hook tagline={props.tagline} />
      </Sequence>

      {/* Scene 2: Problem (90-240 frames, 3-8 sec) */}
      <Sequence from={90} durationInFrames={150}>
        <Scene2Problem />
      </Sequence>

      {/* Scene 3: Solution (240-540 frames, 8-18 sec) */}
      <Sequence from={240} durationInFrames={300}>
        <Scene3Solution appName={props.appName} features={props.features} />
      </Sequence>

      {/* Scene 4: Social Proof (540-690 frames, 18-23 sec) */}
      <Sequence from={540} durationInFrames={150}>
        <Scene4SocialProof userCount={props.userCount} />
      </Sequence>

      {/* Scene 5: CTA (690-900 frames, 23-30 sec) */}
      <Sequence from={690}>
        <Scene5CTA ctaText={props.ctaText} downloadUrl={props.downloadUrl} />
      </Sequence>
    </AbsoluteFill>
  );
};
```

#### Scene Component Example (Scene1Hook.tsx)
```tsx
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface Scene1HookProps {
  tagline: string;
}

export const Scene1Hook: React.FC<Scene1HookProps> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = useMemo(() => {
    return spring({
      frame,
      fps,
      config: { damping: 8, stiffness: 150, mass: 0.5 },
    });
  }, [frame, fps]);

  const opacity = useMemo(() => {
    return interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  }, [frame]);

  // Shake effect
  const shakeX = useMemo(() => {
    if (frame < 15 || frame > 30) return 0;
    return Math.sin(frame * 2) * interpolate(frame, [15, 30], [5, 0], { extrapolateRight: 'clamp' });
  }, [frame]);

  // Background pulse
  const pulseOpacity = useMemo(() => {
    return 0.3 + Math.sin(frame * 0.1) * 0.1;
  }, [frame]);

  return (
    <AbsoluteFill>
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, ${pulseOpacity}) 0%, transparent 70%)`,
        }}
      />

      {/* Main text */}
      <div className="flex items-center justify-center h-full">
        <h1
          className="text-video-2xl font-black text-white text-center uppercase tracking-wider"
          style={{
            opacity,
            transform: `scale(${scale}) translateX(${shakeX}px)`,
            textShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
          }}
        >
          {tagline}
        </h1>
      </div>
    </AbsoluteFill>
  );
};
```

### Phase 5: Register Composition

Update `src/Root.tsx`:

```tsx
import { Composition } from 'remotion';
import { FitnessAppAnnouncement, FitnessAppAnnouncementProps } from './compositions/FitnessAppAnnouncement';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FitnessAppAnnouncement"
        component={FitnessAppAnnouncement}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          appName: 'FitFlow',
          tagline: 'Transform Your Fitness',
          features: ['AI-Powered Workouts', 'Real-time Tracking', 'Personal Coaching'],
          userCount: 100000,
          ctaText: 'Download Free Today',
          downloadUrl: 'https://fitflow.app/download',
        } as FitnessAppAnnouncementProps}
      />
    </>
  );
};
```

### Phase 6: Preview & Iterate

```bash
# Start Remotion Studio for preview
npm run dev

echo "🎬 Remotion Studio opened at http://localhost:3000"
echo "📺 Select 'FitnessAppAnnouncement' from the sidebar"
echo "▶️  Use the playback controls to preview"
echo ""
echo "💡 Adjust scenes in src/compositions/FitnessAppAnnouncement/"
echo "   Changes will hot-reload automatically"
```

### Phase 7: Render Final Video

```bash
# Render to MP4
npx remotion render src/index.ts FitnessAppAnnouncement out/fitness-app-announcement.mp4 \
  --codec=h264 \
  --quality=80

# Verify output
echo "✅ Video rendered: out/fitness-app-announcement.mp4"
ls -lh out/fitness-app-announcement.mp4
```

### Phase 8: Display Summary

```markdown
✅ Video Created Successfully

📹 Composition: FitnessAppAnnouncement
📁 Location: src/compositions/FitnessAppAnnouncement/

📊 Specifications:
   Duration: 30 seconds (900 frames)
   Format: 1920x1080 @ 30fps
   Codec: H.264
   Quality: 80%

🎬 Scenes:
   1. Hook (0-3s) - Bold tagline reveal
   2. Problem (3-8s) - Pain point presentation
   3. Solution (8-18s) - Feature showcase
   4. Social Proof (18-23s) - User stats
   5. CTA (23-30s) - Call to action

📤 Output:
   out/fitness-app-announcement.mp4 (12.4 MB)

🎯 Next Steps:
   - Preview: npm run dev
   - Re-render: npm run render:mp4 FitnessAppAnnouncement
   - Different format: /render-video --format=tiktok
   - Edit scenes: Modify files in src/compositions/FitnessAppAnnouncement/
```

## Video Script Format

When using `--script`, provide a markdown file:

```markdown
# Video Script: [Title]

## Metadata
- Duration: 30 seconds
- Format: 1080x1920 (TikTok)
- Style: Bold, energetic
- Music: upbeat-electronic.mp3

## Scene 1: Hook
**Duration:** 3 seconds
**Visual:** Bold text zoom in
**Text:** "Wait for it..."
**Animation:** Scale from 0 to 1 with bounce

## Scene 2: Main Content
**Duration:** 15 seconds
**Visual:** Product demonstration
**Text:**
- "Feature 1: AI Powered"
- "Feature 2: Lightning Fast"
- "Feature 3: Always Free"
**Animation:** Staggered reveal, 3 seconds each

## Scene 3: CTA
**Duration:** 7 seconds
**Visual:** Download button, app stores
**Text:** "Download Now - Link in Bio"
**Animation:** Pulse effect on button

## Audio
- Background: upbeat-corporate.mp3
- SFX at 0:00: whoosh.mp3
- SFX at 0:15: success-chime.mp3
```

## Content Types

### Marketing/Promotional
- Product launches
- Sale announcements
- Brand introductions
- Event promotions

### Social Media
- TikTok trends
- Instagram Reels
- YouTube Shorts
- Twitter/X clips

### Product Demos
- Feature walkthroughs
- How-to tutorials
- App demonstrations
- Before/after comparisons

### Data Visualization
- Statistics animations
- Growth charts
- Comparison infographics
- Dashboard summaries

### Creative/Entertainment
- Music video visuals
- Lyric videos
- Animated stories
- Artistic expressions

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Remotion not initialized" | No setup | Run `/remotion-setup` first |
| "Composition not found" | ID mismatch | Check Root.tsx registration |
| "Invalid duration" | Frames calculation | Verify fps * seconds |
| "Asset not found" | Missing file | Check public/ directory |
| "Render failed" | Resource issue | Check memory, simplify scenes |

## Tips for Better Videos

### Attention Hooks (First 3 Seconds)
- Start with movement or text
- Ask a question
- Show unexpected visual
- Use bold, contrasting colors

### Pacing
- Match cuts to music beats
- Use faster cuts for energy
- Allow breathing room for key messages
- End with clear CTA

### Typography
- One key message per scene
- Large, readable text (min 48px for mobile)
- High contrast with background
- Consistent font family

### Animations
- Use spring for organic motion
- Stagger sequential elements (50-100ms)
- Ease in/out, avoid linear
- Don't animate everything at once

## Command Metadata

```yaml
name: create-video
category: creative-production
agent: remotion-video-generator
output_type: video_composition_and_file
token_cost: ~15,000
version: 1.0.0
author: Quik Nation AI
```

## Related Commands

- `/remotion-setup` - Initialize project
- `/render-video` - Render with custom options
- `/vibe-build` - Natural language feature building
