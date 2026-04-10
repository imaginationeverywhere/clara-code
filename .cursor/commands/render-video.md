# Render Video

**Version:** 1.0.0
**Agent:** remotion-video-generator
**Output:** Rendered video file(s) in specified format

## Purpose

Render Remotion compositions to video files with customizable codec, quality, and format options. Supports batch rendering for multiple formats and compositions.

## Usage

```bash
# Render specific composition
/render-video MyVideo

# Render with custom output
/render-video ProductDemo --output=videos/demo.mp4

# Render in specific format
/render-video Announcement --format=tiktok

# Render with quality settings
/render-video HighQuality --codec=prores --quality=100

# Batch render multiple formats
/render-video SocialPost --batch=tiktok,reels,shorts

# Render specific frame range
/render-video LongVideo --frames=0-300

# Render with custom props
/render-video Template --props='{"title":"Custom Title"}'
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--output` | Output file path | `out/{composition-id}.{ext}` |
| `--codec` | Video codec | `h264` |
| `--quality` | Quality level (1-100) | `80` |
| `--format` | Format preset (overrides dimensions) | - |
| `--frames` | Frame range (start-end) | All frames |
| `--props` | JSON props to override defaults | - |
| `--batch` | Comma-separated format list | - |
| `--concurrency` | Parallel render threads | Auto |
| `--log-level` | Verbosity (verbose, info, warn, error) | `info` |
| `--overwrite` | Overwrite existing files | `false` |

## Codecs

| Codec | Extension | Quality | File Size | Use Case |
|-------|-----------|---------|-----------|----------|
| `h264` | .mp4 | Good | Medium | Universal playback |
| `h265` | .mp4 | Better | Smaller | Modern devices |
| `vp8` | .webm | Good | Medium | Web browsers |
| `vp9` | .webm | Better | Smaller | Web, high quality |
| `prores` | .mov | Best | Large | Professional editing |
| `gif` | .gif | Limited | Varies | Animations, no audio |

## Format Presets

| Preset | Dimensions | Codec | Optimized For |
|--------|------------|-------|---------------|
| `youtube` | 1920x1080 | h264 | YouTube uploads |
| `youtube-4k` | 3840x2160 | h264 | YouTube 4K |
| `tiktok` | 1080x1920 | h264 | TikTok uploads |
| `reels` | 1080x1920 | h264 | Instagram Reels |
| `shorts` | 1080x1920 | h264 | YouTube Shorts |
| `instagram-post` | 1080x1080 | h264 | Instagram feed |
| `instagram-story` | 1080x1920 | h264 | Instagram Stories |
| `twitter` | 1280x720 | h264 | Twitter/X |
| `linkedin` | 1920x1080 | h264 | LinkedIn |
| `facebook` | 1280x720 | h264 | Facebook |
| `web-optimized` | 1280x720 | h264 | Fast web loading |
| `presentation` | 1920x1080 | h264 | Slideshows, meetings |

## Command Implementation

When this command is invoked, Claude Code should:

### Phase 1: Validate Composition

```bash
# Check if Remotion project exists
if [ ! -f "remotion.config.ts" ] && [ ! -f "src/Root.tsx" ]; then
  echo "❌ Error: No Remotion project found"
  echo "💡 Run /remotion-setup first"
  exit 1
fi

# Verify composition exists
COMPOSITION_ID="$1"
if ! grep -q "id=\"$COMPOSITION_ID\"" src/Root.tsx; then
  echo "❌ Error: Composition '$COMPOSITION_ID' not found"
  echo ""
  echo "Available compositions:"
  grep -o 'id="[^"]*"' src/Root.tsx | sed 's/id="//g' | sed 's/"//g' | while read comp; do
    echo "  - $comp"
  done
  exit 1
fi

echo "✅ Found composition: $COMPOSITION_ID"
```

### Phase 2: Determine Render Settings

```typescript
// Parse options and determine settings
interface RenderConfig {
  compositionId: string;
  outputPath: string;
  codec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores' | 'gif';
  quality: number;
  width?: number;
  height?: number;
  fps?: number;
  frameRange?: [number, number];
  props?: Record<string, unknown>;
}

const formatPresets: Record<string, Partial<RenderConfig>> = {
  tiktok: { width: 1080, height: 1920, codec: 'h264', quality: 85 },
  reels: { width: 1080, height: 1920, codec: 'h264', quality: 85 },
  shorts: { width: 1080, height: 1920, codec: 'h264', quality: 85 },
  youtube: { width: 1920, height: 1080, codec: 'h264', quality: 80 },
  'youtube-4k': { width: 3840, height: 2160, codec: 'h264', quality: 90 },
  'instagram-post': { width: 1080, height: 1080, codec: 'h264', quality: 80 },
  twitter: { width: 1280, height: 720, codec: 'h264', quality: 75 },
  'web-optimized': { width: 1280, height: 720, codec: 'h264', quality: 70 },
};
```

### Phase 3: Execute Render

#### Single Render
```bash
# Basic render
npx remotion render src/index.ts "$COMPOSITION_ID" "$OUTPUT_PATH" \
  --codec="$CODEC" \
  --quality="$QUALITY"

# With format preset
npx remotion render src/index.ts "$COMPOSITION_ID" "out/${COMPOSITION_ID}-tiktok.mp4" \
  --codec=h264 \
  --quality=85 \
  --width=1080 \
  --height=1920

# With frame range
npx remotion render src/index.ts "$COMPOSITION_ID" "$OUTPUT_PATH" \
  --codec="$CODEC" \
  --frames=0-300

# With custom props
npx remotion render src/index.ts "$COMPOSITION_ID" "$OUTPUT_PATH" \
  --props='{"title":"Custom Title","color":"#FF0000"}'
```

#### Batch Render
```bash
# Render multiple formats
FORMATS=("tiktok" "youtube" "instagram-post")

for format in "${FORMATS[@]}"; do
  echo "🎬 Rendering $format format..."

  case $format in
    tiktok|reels|shorts)
      WIDTH=1080; HEIGHT=1920
      ;;
    youtube)
      WIDTH=1920; HEIGHT=1080
      ;;
    instagram-post)
      WIDTH=1080; HEIGHT=1080
      ;;
  esac

  npx remotion render src/index.ts "$COMPOSITION_ID" \
    "out/${COMPOSITION_ID}-${format}.mp4" \
    --codec=h264 \
    --quality=85 \
    --width=$WIDTH \
    --height=$HEIGHT
done
```

### Phase 4: Programmatic Render (Advanced)

```typescript
// scripts/render.ts
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';

async function render(options: RenderConfig) {
  console.log('📦 Bundling project...');

  const bundled = await bundle({
    entryPoint: path.resolve('./src/index.ts'),
    webpackOverride: (config) => config,
  });

  console.log('🔍 Selecting composition...');

  const composition = await selectComposition({
    serveUrl: bundled,
    id: options.compositionId,
    inputProps: options.props || {},
  });

  // Override dimensions if specified
  const finalComposition = {
    ...composition,
    width: options.width || composition.width,
    height: options.height || composition.height,
  };

  console.log(`🎬 Rendering ${options.compositionId}...`);
  console.log(`   Format: ${finalComposition.width}x${finalComposition.height}`);
  console.log(`   Duration: ${composition.durationInFrames} frames`);
  console.log(`   Codec: ${options.codec}`);

  await renderMedia({
    composition: finalComposition,
    serveUrl: bundled,
    codec: options.codec,
    outputLocation: options.outputPath,
    ...(options.quality && { quality: options.quality }),
    ...(options.frameRange && {
      frameRange: options.frameRange,
    }),
    onProgress: ({ progress }) => {
      const percent = Math.round(progress * 100);
      process.stdout.write(`\r   Progress: ${percent}%`);
    },
  });

  console.log('\n✅ Render complete!');
}
```

### Phase 5: Post-Render Processing

```bash
# Get file info
OUTPUT_FILE="out/${COMPOSITION_ID}.mp4"

echo ""
echo "📹 Render Complete"
echo "━━━━━━━━━━━━━━━━━━"

# File details
FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_FILE" 2>/dev/null | cut -d. -f1)
RESOLUTION=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$OUTPUT_FILE" 2>/dev/null)

echo "📁 File: $OUTPUT_FILE"
echo "📊 Size: $FILE_SIZE"
echo "⏱️  Duration: ${DURATION}s"
echo "📐 Resolution: $RESOLUTION"
```

### Phase 6: Display Summary

```markdown
✅ Video Rendered Successfully

📹 Output: out/ProductDemo.mp4

📊 Specifications:
   Resolution: 1920x1080
   Duration: 30.0 seconds
   Codec: H.264
   Quality: 80%
   File Size: 15.2 MB
   Bitrate: 4.05 Mbps

🎯 Render Stats:
   Total Frames: 900
   Render Time: 45.2s
   Speed: 19.9 fps

📤 Ready for:
   ✓ YouTube upload
   ✓ Web embedding
   ✓ Presentation use

💡 Additional Formats:
   /render-video ProductDemo --format=tiktok
   /render-video ProductDemo --batch=tiktok,reels,shorts
```

## Batch Rendering

### Multi-Format Export
```bash
/render-video ProductLaunch --batch=youtube,tiktok,instagram-post
```

Output:
```
out/
├── ProductLaunch-youtube.mp4      (1920x1080)
├── ProductLaunch-tiktok.mp4       (1080x1920)
└── ProductLaunch-instagram-post.mp4  (1080x1080)
```

### Multi-Composition Export
```bash
# Render all compositions in project
/render-video --all

# Render multiple specific compositions
/render-video Intro,Main,Outro --format=youtube
```

## Quality Guidelines

| Use Case | Codec | Quality | Notes |
|----------|-------|---------|-------|
| Social media upload | h264 | 80-85 | Platform will re-encode |
| Website embed | h264 | 70-75 | Optimize for load time |
| Archive/master | prores | 100 | Keep original quality |
| Email attachment | h264 | 60-70 | Keep under 25MB |
| Presentation | h264 | 75-80 | Balance quality/size |
| Professional editing | prores | 100 | For post-production |

## Advanced Options

### Frame Range Rendering
```bash
# Render first 5 seconds only (150 frames at 30fps)
/render-video MyVideo --frames=0-149

# Render specific section
/render-video MyVideo --frames=300-600
```

### Custom Props Override
```bash
# Override default props
/render-video Template --props='{"title":"New Title","primaryColor":"#FF5733"}'
```

### Concurrency Control
```bash
# Limit parallel threads (useful for memory-constrained systems)
/render-video HeavyVideo --concurrency=2
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Out of memory" | Complex scenes | Reduce concurrency, simplify |
| "Codec not supported" | Missing encoder | Install FFmpeg |
| "Permission denied" | Output directory | Check write permissions |
| "Timeout exceeded" | Long render | Increase timeout, optimize |
| "Invalid props" | JSON parse error | Validate JSON format |

## Performance Tips

### Faster Renders
- Use `--concurrency` based on CPU cores
- Lower quality for previews (60-70)
- Render shorter frame ranges for testing
- Use h264 over prores for speed

### Better Quality
- Use prores for archival
- Increase quality to 90-100
- Render at target dimensions (don't upscale)
- Use higher bitrate for complex motion

### Smaller Files
- Use h265 (if supported by target)
- Lower quality to 70-75
- Reduce dimensions for web
- Use appropriate format for platform

## Integration

### CI/CD Pipeline
```yaml
# .github/workflows/render.yml
render-video:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm install
    - run: npx remotion render src/index.ts MyVideo out/video.mp4
    - uses: actions/upload-artifact@v3
      with:
        name: rendered-video
        path: out/video.mp4
```

### Automated Batch Processing
```typescript
// scripts/batch-render.ts
const compositions = ['Intro', 'Feature1', 'Feature2', 'Outro'];
const formats = ['youtube', 'tiktok'];

for (const comp of compositions) {
  for (const format of formats) {
    await render({ compositionId: comp, format });
  }
}
```

## Command Metadata

```yaml
name: render-video
category: creative-production
agent: remotion-video-generator
output_type: video_file
token_cost: ~3,000
version: 1.0.0
author: Quik Nation AI
```

## Related Commands

- `/create-video` - Create new compositions
- `/remotion-setup` - Initialize project
