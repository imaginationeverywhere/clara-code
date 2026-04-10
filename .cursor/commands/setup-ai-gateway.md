# Setup AI Gateway Command

Initialize Cloudflare AI Gateway with multi-model routing for your application.

## Usage

```bash
/setup-ai-gateway [options]
```

## Options

| Option | Description |
|--------|-------------|
| `--minimal` | Basic chat only (Workers AI) |
| `--full` | Chat + generations + all fallbacks |
| `--chat-only` | Only set up chat features |
| `--generations-only` | Only set up generation features |
| `--dry-run` | Show what would be created |

## What This Command Does

### 1. Creates Infrastructure

```
infrastructure/cloudflare/
├── worker/
│   ├── src/
│   │   ├── index.ts           # Main entry point
│   │   ├── routes/
│   │   │   ├── chat.ts        # Chat routing
│   │   │   └── generate.ts    # Generation routing
│   │   ├── providers/
│   │   │   ├── workers-ai.ts  # Cloudflare Workers AI
│   │   │   ├── openrouter.ts  # OpenRouter fallback
│   │   │   └── groq.ts        # Groq fast inference
│   │   ├── middleware/
│   │   │   ├── auth.ts        # User authentication
│   │   │   ├── rate-limit.ts  # Rate limiting
│   │   │   └── usage.ts       # Usage tracking
│   │   └── types.ts           # TypeScript types
│   ├── wrangler.toml          # Cloudflare config
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

### 2. Configures AI Models

**Free Chat Models (Priority Order):**
1. Workers AI - Llama 3.1 8B (primary, cheapest)
2. Groq - Llama 4 Scout (fast fallback)
3. OpenRouter - Gemini 2.0 Flash Free (backup)

**Paid Generation Models:**
- Images: Workers AI FLUX
- Logos: Gemini Pro Image (via Nano Banana)
- Videos: Remotion

### 3. Sets Up Usage Tracking

- KV namespace for usage records
- Per-user rate limiting
- Credit balance tracking
- Cost analytics

### 4. Creates Frontend SDK

```typescript
// Generated in frontend/src/lib/ai.ts
import { AIClient } from '@/lib/ai';

const ai = new AIClient();

// Free chat (included in plan)
const response = await ai.chat('Help me design a logo');

// Paid generation (uses credits)
const image = await ai.generate('image', {
  prompt: 'Modern tech startup logo',
  style: 'minimalist'
});
```

## Prerequisites

### 1. Cloudflare Account

```bash
# Login to Cloudflare
npx wrangler login
```

### 2. AWS SSM Parameters

```bash
# Set required parameters
aws ssm put-parameter \
  --name "/quik-nation/shared/CLOUDFLARE_ACCOUNT_ID" \
  --type "SecureString" \
  --value "your-account-id"

aws ssm put-parameter \
  --name "/quik-nation/shared/CLOUDFLARE_API_TOKEN" \
  --type "SecureString" \
  --value "your-api-token"

# Optional fallback providers
aws ssm put-parameter \
  --name "/quik-nation/shared/OPENROUTER_API_KEY" \
  --type "SecureString" \
  --value "your-openrouter-key"

aws ssm put-parameter \
  --name "/quik-nation/shared/GROQ_API_KEY" \
  --type "SecureString" \
  --value "your-groq-key"
```

### 3. Wrangler CLI

```bash
npm install -g wrangler
```

## Examples

### Basic Setup

```bash
# Initialize with defaults
/setup-ai-gateway
```

### Full Setup with All Features

```bash
# Everything: chat, generations, all providers
/setup-ai-gateway --full
```

### Chat Only (No Generations)

```bash
# Just conversational AI
/setup-ai-gateway --chat-only
```

### Dry Run

```bash
# See what would be created
/setup-ai-gateway --dry-run
```

## Post-Setup

### 1. Deploy Worker

```bash
cd infrastructure/cloudflare/worker
npx wrangler deploy
```

### 2. Update Frontend Environment

```bash
# Add to frontend/.env.local
NEXT_PUBLIC_AI_GATEWAY_URL=https://ai-gateway.your-account.workers.dev
```

### 3. Test the Integration

```bash
# Test chat endpoint
curl -X POST https://ai-gateway.your-account.workers.dev/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Hello!"}'
```

## Cost Estimates

| Feature | Monthly Cost (1000 users) |
|---------|---------------------------|
| Chat (unlimited) | ~$50-200 |
| Image generations | Variable (user pays) |
| Cloudflare Workers | ~$5-20 |
| **Total Platform Cost** | ~$55-220/month |

## Monitoring

After setup, monitor your AI usage:

```bash
# View usage analytics
npx wrangler tail ai-gateway

# Check KV storage
npx wrangler kv:key list --namespace-id YOUR_NAMESPACE_ID
```

## Related Commands

- `/cloudflare:build-agent` - Scaffold custom AI agents
- `/cloudflare:build-mcp` - Build MCP servers
- `/image generate` - Generate images via Nano Banana
- `/create-video` - Generate videos via Remotion

## Troubleshooting

### "Workers AI binding not found"

Ensure `wrangler.toml` has:
```toml
[ai]
binding = "AI"
```

### "Rate limit exceeded"

Increase limits in `middleware/rate-limit.ts` or upgrade Cloudflare plan.

### "Model not available"

Check model availability at https://developers.cloudflare.com/workers-ai/models/

## Version

- **Version:** 1.0.0
- **Last Updated:** 2026-02-02
