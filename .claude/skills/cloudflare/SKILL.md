# Cloudflare Skills for Claude Code

A collection of Agent Skills for building on Cloudflare, Workers, the Agents SDK, and the wider Cloudflare Developer Platform.

## Installation

This skill is pre-installed in the Quik Nation AI Boilerplate. For manual installation:

```bash
# Via Claude Code plugin marketplace
/plugin marketplace add cloudflare/skills

# Or via npx
npx skills
```

## Available Skills

### Contextual Skills (Auto-Activated)

These skills automatically activate based on your conversation context:

| Skill | Description |
|-------|-------------|
| **cloudflare** | Comprehensive platform guidance - Workers, Pages, storage, AI, networking, security, IaC |
| **agents-sdk** | Stateful agent development with scheduling and messaging |
| **durable-objects** | Stateful coordination patterns and real-time features |
| **wrangler** | Deployment tooling for Workers and related services |
| **web-perf** | Core Web Vitals auditing and performance optimization |
| **building-mcp-server-on-cloudflare** | MCP server development guide |
| **building-ai-agent-on-cloudflare** | AI agent creation tutorials |

### Executable Commands

| Command | Description |
|---------|-------------|
| `/cloudflare:build-agent` | Scaffold AI agents using the Agents SDK |
| `/cloudflare:build-mcp` | Generate MCP server projects |

## Quik Nation Integration

### AI Gateway Setup

For Quik Nation projects requiring AI features, use the integrated AI Gateway:

```bash
# Initialize AI Gateway for your project
/setup-ai-gateway

# Or use the Cloudflare command directly
/cloudflare:build-agent
```

### Environment Variables

Store these in AWS SSM Parameter Store:

| Parameter | Description |
|-----------|-------------|
| `/quik-nation/shared/CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `/quik-nation/shared/CLOUDFLARE_API_TOKEN` | API token with Workers AI access |
| `/quik-nation/shared/OPENROUTER_API_KEY` | OpenRouter API key (fallback) |
| `/quik-nation/shared/GROQ_API_KEY` | Groq API key (fast fallback) |

### Pricing Model

| Feature | User Cost | Provider |
|---------|-----------|----------|
| AI Chat | FREE (included) | Workers AI / OpenRouter |
| Image Generation | $0.25-0.50/image | Workers AI FLUX |
| Logo Generation | $0.50-1.00/logo | Gemini Pro Image |
| Video Generation | $1.00-3.00/video | Remotion |

## MCP Servers

The skill connects to remote MCP servers for:

- **Documentation** - Live Cloudflare docs access
- **Observability** - Application monitoring
- **Build Management** - Deployment insights

## Resources

- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Cloudflare Agents SDK](https://developers.cloudflare.com/agents/)
- [Cloudflare Skills GitHub](https://github.com/cloudflare/skills)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)

## Version

- **Version:** 1.0.0
- **Source:** github.com/cloudflare/skills
- **Last Updated:** 2026-02-02
