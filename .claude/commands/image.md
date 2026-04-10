# Image Command

Comprehensive image processing toolkit with choice between free local tools and paid AI services.

## 🚀 QUICK START

### Setup API Key (One-Time)

```bash
# Get GEMINI_API_KEY from AWS SSM Parameter Store (Quik Nation projects)
echo "GEMINI_API_KEY=$(aws ssm get-parameter --name '/quik-nation/shared/GEMINI_API_KEY' --with-decryption --query 'Parameter.Value' --output text)" > .claude/skills/ccskill-nanobanana/.env
```

### Common Operations

```bash
# Generate a logo (PAID - Nano Banana Pro)
/image logo "Modern sports logo with soccer ball"

# Remove background - AI (PAID)
/image remove-bg ./photo.jpg --tool paid

# Remove background - simple (FREE)
/image remove-bg ./logo-white-bg.png --tool free

# Resize images (FREE)
/image resize ./image.png --size 128x128

# Generate any image (PAID)
/image generate "World Cup stadium at sunset, photorealistic"
```

---

## Usage

```
/image <action> [options]
```

## Actions

| Action | Description | Free Tool | Paid Tool |
|--------|-------------|-----------|-----------|
| `remove-bg` | Remove image backgrounds | Pillow | Nano Banana Pro |
| `generate` | Create new images from text | - | Nano Banana Pro |
| `edit` | Modify existing images | Pillow | Nano Banana Pro |
| `logo` | Generate or process logos | - | Nano Banana Pro |
| `resize` | Resize/crop images | Pillow | - |
| `convert` | Convert image formats | Pillow | - |
| `optimize` | Compress for web | Pillow | - |
| `style` | Apply style transfer | - | Nano Banana Pro |

---

## Common Options

| Option | Description | Default |
|--------|-------------|---------|
| `--tool <free\|paid\|auto>` | Choose processing tool | auto |
| `--output <directory>` | Output directory | same as input |
| `--format <png\|webp\|jpg>` | Output format | png |
| `--batch` | Process all images in directory | false |
| `--estimate` | Show cost estimate only | false |

---

## Tool Selection

### Auto Mode (Default)

The command analyzes the task and recommends the best tool:

| Task | Recommended | Why |
|------|-------------|-----|
| Remove solid color background | **Free** | Simple threshold works |
| Remove complex background | **Paid** | AI understands context |
| Generate new image | **Paid** | Requires AI |
| Create logo | **Paid** | Requires AI creativity |
| Resize/crop | **Free** | Basic operation |
| Format conversion | **Free** | Basic operation |
| Style transfer | **Paid** | Requires AI |

### Free Tool: Pillow/PIL

- **Cost:** $0
- **Speed:** Instant (local)
- **Best for:** Basic operations, solid backgrounds, resizing, format conversion
- **Limitations:** No AI capabilities, struggles with complex tasks

### Paid Tool: Nano Banana Pro (Gemini 3 Pro Image)

- **Model:** `gemini-3-pro-image-preview`
- **Cost:** ~$0.01-0.20 per image
- **Speed:** 5-15 seconds (API)
- **Best for:** AI generation, complex editing, logo creation, style transfer
- **Requires:** Gemini API key with billing enabled

---

## Action Details

### 1. Remove Background (`remove-bg`)

Remove backgrounds from images, making them transparent or replacing with a color.

```bash
# Auto-select tool
/image remove-bg ./logo.png

# Force free tool (solid backgrounds only)
/image remove-bg ./logo.png --tool free

# Force paid tool (complex backgrounds)
/image remove-bg ./photo.jpg --tool paid

# Replace with color instead of transparent
/image remove-bg ./logo.png --color "#001F4F"

# Batch process directory
/image remove-bg ./logos/ --batch
```

**Cost Estimate:**
- Free: $0.00
- Paid: ~$0.03-0.05 per image

---

### 2. Generate Images (`generate`)

Create new images from text descriptions. **Paid tool only.**

```bash
# Generate from prompt
/image generate "A modern soccer logo with blue and gold colors, minimalist design"

# Specify aspect ratio
/image generate "World Cup trophy illustration" --aspect 1:1

# Generate multiple variations
/image generate "Sports event banner" --count 3

# High resolution
/image generate "Stadium aerial view" --resolution 4K
```

**Cost Estimate:** ~$0.05-0.15 per image

---

### 3. Edit Images (`edit`)

Modify existing images with AI-powered editing.

```bash
# AI-powered edit (describe changes)
/image edit ./photo.jpg "Remove the person in the background"

# Change colors
/image edit ./logo.png "Change the blue to green"

# Add elements
/image edit ./stadium.jpg "Add fireworks in the sky"

# Simple crop (free)
/image edit ./photo.jpg --crop 800x600 --tool free
```

**Cost Estimate:**
- Free (basic): $0.00
- Paid (AI): ~$0.05-0.10 per edit

---

### 4. Logo Operations (`logo`)

Generate or process logos. **Paid tool for generation.**

```bash
# Generate new logo
/image logo "World Cup Ready California - modern sports logo with bear and soccer ball"

# Generate logo variations
/image logo "Soccer team logo" --variations 5

# Process existing logo (remove bg + optimize)
/image logo ./existing-logo.png --process

# Generate favicon versions
/image logo ./logo.png --favicon
```

**Cost Estimate:** ~$0.05-0.15 per logo

---

### 5. Resize Images (`resize`)

Resize, crop, or scale images. **Free tool.**

```bash
# Resize to specific dimensions
/image resize ./photo.jpg --size 1200x800

# Resize maintaining aspect ratio
/image resize ./photo.jpg --width 1200

# Create thumbnail
/image resize ./photo.jpg --thumbnail 150x150

# Batch resize
/image resize ./images/ --batch --width 800
```

**Cost:** $0.00 (always free)

---

### 6. Convert Formats (`convert`)

Convert between image formats. **Free tool.**

```bash
# PNG to WebP
/image convert ./logo.png --format webp

# JPG to PNG
/image convert ./photo.jpg --format png

# Batch convert
/image convert ./images/ --batch --format webp
```

**Cost:** $0.00 (always free)

---

### 7. Optimize for Web (`optimize`)

Compress images for web use. **Free tool.**

```bash
# Optimize single image
/image optimize ./photo.jpg

# Set quality level (1-100)
/image optimize ./photo.jpg --quality 85

# Batch optimize
/image optimize ./images/ --batch

# Optimize and convert to WebP
/image optimize ./images/ --batch --format webp
```

**Cost:** $0.00 (always free)

---

### 8. Style Transfer (`style`)

Apply artistic styles to images. **Paid tool only.**

```bash
# Apply style
/image style ./photo.jpg "oil painting style"

# Specific artist style
/image style ./photo.jpg "in the style of pixel art"

# Match another image's style
/image style ./photo.jpg --reference ./style-image.jpg
```

**Cost Estimate:** ~$0.05-0.15 per image

---

## Cost Estimation

Before processing, the command shows an estimate:

```
📊 Cost Estimate for /image remove-bg

Images to process: 9
Recommended tool: Paid (Nano Banana Pro)
Reason: Complex logo designs with gradients

Estimated costs:
  • Free (Pillow):      $0.00  ⚠️  May have quality issues
  • Paid (Nano Banana): ~$0.45 (9 × ~$0.05)

Choose tool:
  [1] Free - Pillow (local, instant)
  [2] Paid - Nano Banana Pro (AI, ~$0.45)
  [3] Cancel

Your choice: _
```

---

## Pricing Reference

| Operation | Free | Paid |
|-----------|------|------|
| Remove solid background | $0.00 | ~$0.03 |
| Remove complex background | - | ~$0.05 |
| Generate simple image | - | ~$0.05 |
| Generate complex image | - | ~$0.10-0.15 |
| Generate logo | - | ~$0.05-0.10 |
| AI edit | - | ~$0.05-0.10 |
| Resize/crop | $0.00 | - |
| Format convert | $0.00 | - |
| Style transfer | - | ~$0.10-0.15 |

*Prices are estimates based on Google Gemini API pricing.*

---

## Prerequisites

### For Free Tool (Pillow)

```bash
pip install pillow
```

### For Paid Tool (Nano Banana Pro)

**Option A: From AWS SSM Parameter Store (Recommended)**

All Quik Nation boilerplate projects have access to the shared Gemini API key stored in AWS SSM:

```bash
# Retrieve key from AWS SSM and create .env file
echo "GEMINI_API_KEY=$(aws ssm get-parameter --name '/quik-nation/shared/GEMINI_API_KEY' --with-decryption --query 'Parameter.Value' --output text)" > .claude/skills/ccskill-nanobanana/.env

# Verify the key was set
cat .claude/skills/ccskill-nanobanana/.env
# Should output: GEMINI_API_KEY=AIza...
```

**Option B: Manual Setup**

1. **Get Gemini API Key:** https://aistudio.google.com/apikey
2. **Enable Billing:** https://console.cloud.google.com/billing (REQUIRED)
3. **Add to environment:**
   ```bash
   echo "GEMINI_API_KEY=your-gemini-api-key" > .claude/skills/ccskill-nanobanana/.env
   ```

**AWS SSM Parameter Details:**
- **Parameter Name:** `/quik-nation/shared/GEMINI_API_KEY`
- **Type:** SecureString (encrypted)
- **Region:** us-east-1

---

## Workflow

```
1. ANALYZE   → Inspect task requirements
2. RECOMMEND → Suggest free or paid based on complexity
3. ESTIMATE  → Show cost for paid option
4. CONFIRM   → User chooses tool
5. PROCESS   → Execute operation
6. REPORT    → Show results and actual cost (if paid)
```

---

## S3 Integration

After processing, optionally upload to S3:

```bash
# Process and upload
/image remove-bg ./logo.png --upload-s3 --bucket world-cup-ready-assets

# Upload to specific path
/image logo ./logo.png --process --upload-s3 --bucket my-bucket --path logos/
```

---

## Examples

```bash
# Remove background from logo (auto-select tool)
/image remove-bg ./wcr-logo.png

# Generate a new World Cup logo
/image generate "World Cup 2026 celebration logo, modern minimalist, red white blue"

# Batch optimize images for web
/image optimize ./images/ --batch --format webp --quality 85

# Create logo with transparent background
/image logo "Soccer ball with flames" --output ./new-logo.png

# Get cost estimate before batch processing
/image remove-bg ./logos/ --batch --estimate
```

---

## Agent

This command is powered by the `image-processor` agent.

See: `.claude/agents/image-processor.md`

---

## Version

- **Version:** 2.0.0
- **Last Updated:** 2026-01-26
- **Tools:** Pillow (Free), Nano Banana Pro (Paid)
