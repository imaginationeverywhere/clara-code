# Remotion Setup

**Version:** 1.0.0
**Agent:** remotion-video-generator
**Output:** Initialized Remotion project ready for video creation

## Purpose

Initialize a new Remotion project for programmatic video creation. Supports both standalone projects and integration into existing monorepo workspaces.

## Usage

```bash
# Initialize new standalone project
/remotion-setup

# Initialize in existing monorepo
/remotion-setup --workspace=remotion

# Initialize with specific template
/remotion-setup --template=marketing

# Quick setup with defaults
/remotion-setup --quick
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--workspace` | Target workspace in monorepo | `remotion` |
| `--template` | Starter template | `blank` |
| `--tailwind` | Include TailwindCSS | `true` |
| `--typescript` | Use TypeScript | `true` |
| `--mcp` | Configure MCP server | `true` |
| `--quick` | Skip prompts, use defaults | `false` |

## Templates

| Template | Description |
|----------|-------------|
| `blank` | Empty project, full flexibility |
| `marketing` | Pre-built marketing video components |
| `social` | Social media formats (TikTok, Reels) |
| `product-demo` | Product demonstration templates |
| `data-viz` | Data visualization components |

## Command Implementation

When this command is invoked, Claude Code should:

### Phase 1: Project Detection

```bash
# Check if we're in a monorepo
if [ -f "package.json" ] && grep -q "workspaces" package.json; then
  echo "📦 Detected monorepo structure"
  SETUP_MODE="workspace"
else
  echo "📦 Standalone project setup"
  SETUP_MODE="standalone"
fi

# Check for existing Remotion installation
if [ -d "remotion" ] || [ -d "frontend/remotion" ]; then
  echo "⚠️  Existing Remotion directory found"
  read -p "Overwrite? (y/n): " OVERWRITE
fi
```

### Phase 2: Interactive Configuration (unless --quick)

```markdown
🎬 Remotion Video Project Setup

1. Project Location
   ○ New standalone project
   ○ Add to frontend/ workspace
   ○ Create remotion/ workspace (Recommended)
   ○ Custom location

2. Video Format Focus
   ☑ Marketing/Promotional (16:9)
   ☑ Social Media (9:16 vertical)
   ☑ Product Demos
   ☑ Data Visualizations
   ○ Custom formats only

3. Include Starter Templates?
   ○ Yes, all templates (Recommended)
   ○ Yes, selected templates
   ○ No, blank project

4. Additional Integrations
   ☑ TailwindCSS
   ☑ Remotion MCP Server
   ☐ AWS S3 for asset storage
   ☐ FFmpeg for advanced encoding
```

### Phase 3: Project Initialization

#### Standalone Project
```bash
# Create new Remotion project
npx create-video@latest $PROJECT_NAME --template=blank

cd $PROJECT_NAME

# Install additional dependencies
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Remotion extras
npm install @remotion/transitions @remotion/media-utils
```

#### Monorepo Workspace
```bash
# Create workspace directory
mkdir -p remotion
cd remotion

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "@project/remotion",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle",
    "render": "remotion render",
    "preview": "remotion preview"
  }
}
EOF

# Install Remotion packages
npm install remotion @remotion/cli @remotion/player @remotion/renderer
npm install @remotion/transitions @remotion/media-utils @remotion/bundler
npm install -D typescript @types/react @types/react-dom

# Install TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Phase 4: Configure TailwindCSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Video-optimized font sizes
      fontSize: {
        'video-sm': '24px',
        'video-base': '32px',
        'video-lg': '48px',
        'video-xl': '64px',
        'video-2xl': '96px',
        'video-3xl': '128px',
      },
      // Common video dimensions
      width: {
        'video-1080': '1920px',
        'video-720': '1280px',
        'video-vertical': '1080px',
      },
      height: {
        'video-1080': '1080px',
        'video-720': '720px',
        'video-vertical': '1920px',
      },
    },
  },
  plugins: [],
};
```

### Phase 5: Create Base Structure

```bash
# Create directory structure
mkdir -p src/{compositions,components,scenes,assets,styles}
mkdir -p public/{images,audio,video}
```

#### src/Root.tsx
```tsx
import { Composition } from 'remotion';
import { ExampleVideo } from './compositions/ExampleVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Example composition - delete or modify as needed */}
      <Composition
        id="ExampleVideo"
        component={ExampleVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Welcome to Remotion',
        }}
      />

      {/* Add your compositions here */}
    </>
  );
};
```

#### src/index.ts
```tsx
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';
import './styles/global.css';

registerRoot(RemotionRoot);
```

#### src/styles/global.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Video-specific base styles */
@layer base {
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
}

/* Utility classes for video */
@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .text-shadow-lg {
    text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.5);
  }

  .safe-zone {
    padding: 5%;
  }
}
```

### Phase 6: Create Base Components

#### src/components/AnimatedText.tsx
```tsx
import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn' | 'typewriter';
  className?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  animation = 'fadeIn',
  className = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const style = useMemo(() => {
    switch (animation) {
      case 'fadeIn':
        return {
          opacity: interpolate(adjustedFrame, [0, 20], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        };

      case 'slideUp':
        return {
          opacity: interpolate(adjustedFrame, [0, 15], [0, 1], {
            extrapolateRight: 'clamp',
          }),
          transform: `translateY(${interpolate(
            adjustedFrame,
            [0, 20],
            [40, 0],
            { extrapolateRight: 'clamp' }
          )}px)`,
        };

      case 'slideDown':
        return {
          opacity: interpolate(adjustedFrame, [0, 15], [0, 1], {
            extrapolateRight: 'clamp',
          }),
          transform: `translateY(${interpolate(
            adjustedFrame,
            [0, 20],
            [-40, 0],
            { extrapolateRight: 'clamp' }
          )}px)`,
        };

      case 'scaleIn':
        const scale = spring({
          frame: adjustedFrame,
          fps,
          config: { damping: 12, stiffness: 100 },
        });
        return {
          opacity: interpolate(adjustedFrame, [0, 10], [0, 1], {
            extrapolateRight: 'clamp',
          }),
          transform: `scale(${scale})`,
        };

      default:
        return {};
    }
  }, [adjustedFrame, animation, fps]);

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
};
```

#### src/components/Background.tsx
```tsx
import React from 'react';

interface BackgroundProps {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl';
  imageUrl?: string;
  children?: React.ReactNode;
}

export const Background: React.FC<BackgroundProps> = ({
  type,
  color = '#000000',
  gradientFrom = '#3B82F6',
  gradientTo = '#8B5CF6',
  gradientDirection = 'to-br',
  imageUrl,
  children,
}) => {
  const getBackgroundClass = () => {
    switch (type) {
      case 'solid':
        return '';
      case 'gradient':
        return `bg-gradient-${gradientDirection}`;
      case 'image':
        return 'bg-cover bg-center';
      default:
        return '';
    }
  };

  const getBackgroundStyle = () => {
    switch (type) {
      case 'solid':
        return { backgroundColor: color };
      case 'gradient':
        return {
          backgroundImage: `linear-gradient(${
            gradientDirection === 'to-br' ? '135deg' : '90deg'
          }, ${gradientFrom}, ${gradientTo})`,
        };
      case 'image':
        return { backgroundImage: `url(${imageUrl})` };
      default:
        return {};
    }
  };

  return (
    <div
      className={`absolute inset-0 ${getBackgroundClass()}`}
      style={getBackgroundStyle()}
    >
      {children}
    </div>
  );
};
```

### Phase 7: Create Example Composition

#### src/compositions/ExampleVideo/index.tsx
```tsx
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { AnimatedText } from '../../components/AnimatedText';
import { Background } from '../../components/Background';

interface ExampleVideoProps {
  title: string;
}

export const ExampleVideo: React.FC<ExampleVideoProps> = ({ title }) => {
  return (
    <AbsoluteFill>
      <Background
        type="gradient"
        gradientFrom="#1E3A8A"
        gradientTo="#7C3AED"
      />

      {/* Intro */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill className="flex items-center justify-center">
          <AnimatedText animation="scaleIn" className="text-video-2xl font-bold text-white">
            {title}
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      {/* Main Content */}
      <Sequence from={90} durationInFrames={150}>
        <AbsoluteFill className="flex flex-col items-center justify-center gap-8">
          <AnimatedText animation="slideUp" delay={0} className="text-video-xl font-bold text-white">
            Create Videos
          </AnimatedText>
          <AnimatedText animation="slideUp" delay={15} className="text-video-lg text-white/80">
            With React & Remotion
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      {/* Outro */}
      <Sequence from={240}>
        <AbsoluteFill className="flex items-center justify-center">
          <AnimatedText animation="fadeIn" className="text-video-lg font-medium text-white">
            Start Creating Today
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
```

### Phase 8: Configure MCP Server

Add to Claude Code settings or `.claude/settings.json`:

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

### Phase 9: Update Package Scripts

```json
{
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle src/index.ts --out-dir=dist",
    "render": "remotion render src/index.ts",
    "render:mp4": "remotion render src/index.ts --codec=h264",
    "render:webm": "remotion render src/index.ts --codec=vp9",
    "render:gif": "remotion render src/index.ts --codec=gif",
    "preview": "remotion preview src/index.ts",
    "type-check": "tsc --noEmit"
  }
}
```

### Phase 10: Display Summary

```markdown
✅ Remotion Project Setup Complete

📁 Project Structure:
   remotion/
   ├── src/
   │   ├── Root.tsx              # Composition registry
   │   ├── index.ts              # Entry point
   │   ├── compositions/         # Video compositions
   │   │   └── ExampleVideo/
   │   ├── components/           # Reusable components
   │   │   ├── AnimatedText.tsx
   │   │   └── Background.tsx
   │   ├── scenes/               # Scene components
   │   ├── assets/               # Code assets
   │   └── styles/
   │       └── global.css        # TailwindCSS
   ├── public/                   # Static assets
   │   ├── images/
   │   ├── audio/
   │   └── video/
   ├── package.json
   ├── tsconfig.json
   └── tailwind.config.js

🚀 Quick Start:
   cd remotion
   npm run dev                   # Open Remotion Studio

📹 Create Videos:
   /create-video "Your video description here"

🎬 Render Output:
   npm run render:mp4 ExampleVideo out/example.mp4

📚 Documentation:
   https://www.remotion.dev/docs

🔧 MCP Server: Configured ✓
   Remotion documentation available in Claude Code
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "npm not found" | Node.js not installed | Install Node.js 18+ |
| "create-video failed" | Network issue | Check internet, retry |
| Port 3000 in use | Dev server conflict | Use different port |
| TypeScript errors | Missing types | Run `npm install -D @types/react` |

## Integration

### Monorepo Root package.json
```json
{
  "workspaces": [
    "frontend",
    "backend",
    "remotion"
  ]
}
```

### VS Code Settings (Optional)
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

## Command Metadata

```yaml
name: remotion-setup
category: creative-production
agent: remotion-video-generator
output_type: initialized_project
token_cost: ~5,000
version: 1.0.0
author: Quik Nation AI
```
