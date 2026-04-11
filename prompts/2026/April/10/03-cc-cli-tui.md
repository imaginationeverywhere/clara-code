# Prompt 03 — Clara Code CLI / TUI
# Surface: Terminal Voice Interface (Ink)
# Branch: feat/cli-tui-complete
# Machine: QCS1

You are building the Clara Code terminal UI — a full-screen voice interface that runs in the terminal. It uses Ink (React for CLIs) and connects to the Clara voice gateway on Modal.

## What You Are Building

A full-screen terminal application in `packages/cli/` that:
- Launches with `clara tui` via a Commander CLI entry point
- Renders a full-screen layout with: **minimal text header (no ASCII art)**, voice status bar, conversation history, and input prompt
- Connects to `https://info-24346--hermes-gateway.modal.run` for voice I/O
- **Voice is text-only by default** — no audio output unless partner opts in with `--voice` flag
- TypeScript throughout, strict mode

## Exact File Structure

```
packages/cli/
├── src/
│   index.ts           # Commander entry: `clara` command
│   tui.tsx            # Full-screen Ink TUI (main component)
│   components/
│     Header.tsx       # ASCII Clara logo + version
│     StatusBar.tsx    # Voice status, model, latency
│     MessageFeed.tsx  # Scrollable conversation history
│     InputBar.tsx     # Text input + mic button
│     VoiceWave.tsx    # Animated waveform when mic active
│   hooks/
│     useVoice.ts      # Voice gateway hook (fetch + state)
│     useKeyboard.ts   # Global keyboard shortcuts
│   lib/
│     gateway.ts       # Clara gateway client
│     config.ts        # Config from ~/.clara/config.json
├── package.json
├── tsconfig.json
└── README.md
```

## package.json

```json
{
  "name": "@clara/cli",
  "version": "0.1.0",
  "description": "Clara Code terminal voice interface",
  "type": "module",
  "bin": {
    "clara": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsup src/index.ts --format esm --dts --out-dir dist",
    "tui": "tsx src/index.ts tui",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "ink": "^5.0.1",
    "react": "^18.2.0",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "tsup": "^8.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

## src/index.ts

```typescript
#!/usr/bin/env node
import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "./tui.js";

const program = new Command();

program
  .name("clara")
  .description("Clara Code — AI voice coding assistant")
  .version("0.1.0");

program
  .command("tui")
  .description("Launch full-screen voice TUI")
  .option("-u, --user <name>", "User name sent to gateway", "dev")
  .option(
    "-g, --gateway <url>",
    "Clara gateway URL",
    "https://info-24346--hermes-gateway.modal.run"
  )
  .action((opts: { user: string; gateway: string }) => {
    render(
      React.createElement(App, {
        userId: opts.user,
        gatewayUrl: opts.gateway,
      })
    );
  });

// Default action — show help
program.parse(process.argv);
if (process.argv.length <= 2) {
  program.help();
}
```

## src/tui.tsx

```typescript
import React, { useState, useEffect } from "react";
import { Box, useApp, useInput } from "ink";
import { Header } from "./components/Header.js";
import { StatusBar } from "./components/StatusBar.js";
import { MessageFeed } from "./components/MessageFeed.js";
import { InputBar } from "./components/InputBar.js";
import { VoiceWave } from "./components/VoiceWave.js";
import { useVoice } from "./hooks/useVoice.js";

export interface AppProps {
  userId: string;
  gatewayUrl: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  text: string;
  ts: Date;
}

let msgId = 0;

export function App({ userId, gatewayUrl }: AppProps) {
  const { exit } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      role: "system",
      text: 'Clara is ready. Press [m] to toggle mic, [q] to quit.',
      ts: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [latency, setLatency] = useState<number | null>(null);

  const { isMicActive, isLoading, toggleMic, sendText } = useVoice({
    gatewayUrl,
    userId,
    onResult: (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: msgId++, role: "user", text, ts: new Date() },
      ]);
    },
    onReply: (reply: string, ms: number) => {
      setLatency(ms);
      setMessages((prev) => [
        ...prev,
        { id: msgId++, role: "assistant", text: reply, ts: new Date() },
      ]);
    },
    onError: (err: string) => {
      setMessages((prev) => [
        ...prev,
        { id: msgId++, role: "system", text: `Error: ${err}`, ts: new Date() },
      ]);
    },
  });

  // Keyboard shortcuts
  useInput((input, key) => {
    if (input === "q" && key.ctrl) {
      exit();
      return;
    }
    if (input === "m" && !key.ctrl && !key.meta) {
      toggleMic();
      return;
    }
    if (key.return) {
      if (inputText.trim()) {
        const text = inputText.trim();
        setInputText("");
        setMessages((prev) => [
          ...prev,
          { id: msgId++, role: "user", text, ts: new Date() },
        ]);
        sendText(text);
      }
      return;
    }
    if (key.backspace || key.delete) {
      setInputText((prev) => prev.slice(0, -1));
      return;
    }
    if (input && !key.ctrl && !key.meta) {
      setInputText((prev) => prev + input);
    }
  });

  return (
    <Box flexDirection="column" height="100%">
      <Header />
      <StatusBar
        isMicActive={isMicActive}
        isLoading={isLoading}
        model="DeepSeek V3.2"
        latency={latency}
        userId={userId}
      />
      {isMicActive && <VoiceWave />}
      <MessageFeed messages={messages} />
      <InputBar
        value={inputText}
        isMicActive={isMicActive}
        isLoading={isLoading}
      />
    </Box>
  );
}
```

## src/components/Header.tsx

**IMPORTANT — VRD-001 §C1 specifies:** "No ASCII art. No banner that takes 20 lines."
The header is minimal text only. Terminal-native users value density over decoration.

```typescript
import React from "react";
import { Box, Text } from "ink";

// VRD-001 §C1 — First Launch (TUI, New Session)
// Exact terminal output per the approved voice script:
//
//   Clara Code v[version]
//
//   I've never written a line of code.
//   Whether you've done it before or not.
//
//   We speak things into existence around here.
//
//   > What are we building?
//
// The sarcastic edge survives in text form the same way it does in voice.
// The `>` prompt is the signal: the conversation has started.

interface HeaderProps {
  version: string;
  isReturnSession: boolean;
  lastProject?: string | null;
  userName?: string | null;
}

export function Header({ version, isReturnSession, lastProject, userName }: HeaderProps) {
  if (isReturnSession) {
    // VRD-001 §C2 — Return Session
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Text color="#3B82F6" bold>
          Clara Code{userName ? ` — ${userName}` : ""}
        </Text>
        <Text> </Text>
        {lastProject && (
          <Text color="#6B7280" dimColor>
            Last session: {lastProject}
          </Text>
        )}
        <Text> </Text>
      </Box>
    );
  }

  // VRD-001 §C1 — First Launch
  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text color="#3B82F6" bold>
        Clara Code v{version}
      </Text>
      <Text> </Text>
      <Text color="#E2E8F0">{"  I've never written a line of code."}</Text>
      <Text color="#E2E8F0">{"  Whether you've done it before or not."}</Text>
      <Text> </Text>
      <Text color="#9CA3AF">{"  We speak things into existence around here."}</Text>
      <Text> </Text>
    </Box>
  );
}
```

## src/components/StatusBar.tsx

```typescript
import React from "react";
import { Box, Text } from "ink";

interface StatusBarProps {
  isMicActive: boolean;
  isLoading: boolean;
  model: string;
  latency: number | null;
  userId: string;
}

export function StatusBar({
  isMicActive,
  isLoading,
  model,
  latency,
  userId,
}: StatusBarProps) {
  const micStatus = isMicActive
    ? "● LIVE"
    : isLoading
    ? "◌ Thinking..."
    : "○ Ready";

  const micColor = isMicActive ? "red" : isLoading ? "yellow" : "green";

  return (
    <Box
      borderStyle="single"
      borderColor="#374151"
      paddingX={2}
      justifyContent="space-between"
    >
      <Text color={micColor} bold>
        {micStatus}
      </Text>
      <Text color="#6B7280">
        {model}
        {latency !== null ? ` · ${latency}ms` : ""}
      </Text>
      <Text color="#6B7280">
        user: {userId} · [m] mic · [Enter] send · [Ctrl+Q] quit
      </Text>
    </Box>
  );
}
```

## src/components/MessageFeed.tsx

```typescript
import React from "react";
import { Box, Text, Static } from "ink";
import type { Message } from "../tui.js";

interface MessageFeedProps {
  messages: Message[];
}

const roleColor: Record<Message["role"], string> = {
  user: "#3B82F6",
  assistant: "#7C3AED",
  system: "#6B7280",
};

const roleLabel: Record<Message["role"], string> = {
  user: "  You",
  assistant: "Clara",
  system: "  sys",
};

export function MessageFeed({ messages }: MessageFeedProps) {
  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1} overflowY="hidden">
      <Static items={messages}>
        {(msg) => (
          <Box key={msg.id} marginBottom={1} flexDirection="column">
            <Box gap={1}>
              <Text color={roleColor[msg.role]} bold>
                {roleLabel[msg.role]}
              </Text>
              <Text color="#9CA3AF" dimColor>
                {msg.ts.toLocaleTimeString("en-US", { hour12: false })}
              </Text>
            </Box>
            <Box paddingLeft={6}>
              <Text
                color={msg.role === "system" ? "#6B7280" : "#E2E8F0"}
                dimColor={msg.role === "system"}
              >
                {msg.text}
              </Text>
            </Box>
          </Box>
        )}
      </Static>
    </Box>
  );
}
```

## src/components/InputBar.tsx

```typescript
import React from "react";
import { Box, Text } from "ink";

interface InputBarProps {
  value: string;
  isMicActive: boolean;
  isLoading: boolean;
}

export function InputBar({ value, isMicActive, isLoading }: InputBarProps) {
  const placeholder = isMicActive
    ? "Listening... (press [m] to stop)"
    : isLoading
    ? "Clara is thinking..."
    : "Type a message or press [m] to speak";

  return (
    <Box
      borderStyle="single"
      borderColor="#3B82F6"
      paddingX={2}
      alignItems="center"
      gap={1}
    >
      <Text color="#3B82F6" bold>
        ›
      </Text>
      {value ? (
        <Text color="#E2E8F0">
          {value}
          <Text color="#3B82F6">█</Text>
        </Text>
      ) : (
        <Text color="#4B5563" dimColor>
          {placeholder}
        </Text>
      )}
    </Box>
  );
}
```

## src/components/VoiceWave.tsx

```typescript
import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";

const WAVE_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const BARS = 20;

function randomBar(): string {
  return WAVE_CHARS[Math.floor(Math.random() * WAVE_CHARS.length)];
}

export function VoiceWave() {
  const [bars, setBars] = useState<string[]>(Array(BARS).fill("▁"));

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(Array.from({ length: BARS }, randomBar));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box paddingX={2} paddingY={0} justifyContent="center">
      <Text color="#DC2626">{bars.join("")}</Text>
      <Text color="#6B7280"> ● Recording</Text>
    </Box>
  );
}
```

## src/hooks/useVoice.ts

```typescript
import { useState, useCallback, useRef } from "react";
import { claraGateway } from "../lib/gateway.js";

interface UseVoiceOptions {
  gatewayUrl: string;
  userId: string;
  onResult: (text: string) => void;
  onReply: (reply: string, latencyMs: number) => void;
  onError: (error: string) => void;
}

interface UseVoiceReturn {
  isMicActive: boolean;
  isLoading: boolean;
  toggleMic: () => void;
  sendText: (text: string) => Promise<void>;
}

export function useVoice({
  gatewayUrl,
  userId,
  onResult,
  onReply,
  onError,
}: UseVoiceOptions): UseVoiceReturn {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Note: Web Speech API is not available in Node.js terminal.
  // In TUI mode, voice input is simulated via text input.
  // For actual voice, pipe to a local STT service or use a native addon.
  const toggleMic = useCallback(() => {
    if (isMicActive) {
      // Stop "recording"
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsMicActive(false);
    } else {
      // Start "recording" (terminal placeholder — real STT via stdin pipe)
      setIsMicActive(true);
    }
  }, [isMicActive]);

  const sendText = useCallback(
    async (text: string) => {
      setIsLoading(true);
      const start = Date.now();
      try {
        const reply = await claraGateway(gatewayUrl, userId, text);
        onReply(reply, Date.now() - start);
      } catch (err) {
        onError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [gatewayUrl, userId, onReply, onError]
  );

  return { isMicActive, isLoading, toggleMic, sendText };
}
```

## src/lib/gateway.ts

```typescript
/**
 * Clara gateway client.
 * Sends a message to the Hermes voice gateway on Modal and returns the text reply.
 */
export async function claraGateway(
  gatewayUrl: string,
  userId: string,
  message: string
): Promise<string> {
  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "tui",
      user: userId,
      message,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gateway ${response.status}: ${body || response.statusText}`);
  }

  const data = (await response.json()) as {
    reply?: string;
    text?: string;
    message?: string;
  };

  return data.reply ?? data.text ?? data.message ?? "Clara has no response.";
}
```

## src/lib/config.ts

```typescript
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

interface ClaraConfig {
  gatewayUrl: string;
  userId: string;
}

const CONFIG_PATH = join(homedir(), ".clara", "config.json");

const DEFAULTS: ClaraConfig = {
  gatewayUrl: "https://info-24346--hermes-gateway.modal.run",
  userId: "dev",
};

export function loadConfig(): ClaraConfig {
  if (!existsSync(CONFIG_PATH)) {
    return DEFAULTS;
  }
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as Partial<ClaraConfig>;
    return { ...DEFAULTS, ...raw };
  } catch {
    return DEFAULTS;
  }
}

export function saveConfig(config: Partial<ClaraConfig>): void {
  const dir = join(homedir(), ".clara");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const current = loadConfig();
  writeFileSync(CONFIG_PATH, JSON.stringify({ ...current, ...config }, null, 2));
}
```

## README.md

```markdown
# @clara/cli — Clara Code Terminal Voice Interface

Full-screen terminal voice assistant powered by Clara's Hermes gateway.

## Install

```bash
npm install -g @clara/cli
```

## Usage

```bash
# Launch full-screen TUI
clara tui

# With custom options
clara tui --user mo --gateway https://your-gateway.modal.run

# Show help
clara --help
```

## TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `m` | Toggle mic (placeholder — pipe STT for real audio) |
| `Enter` | Send typed message to Clara |
| `Backspace` | Delete last character |
| `Ctrl+Q` | Quit |

## Configuration

Edit `~/.clara/config.json`:

```json
{
  "gatewayUrl": "https://info-24346--hermes-gateway.modal.run",
  "userId": "your-name"
}
```

## Architecture

- **Ink** — React for terminals (full-screen layout)
- **Commander** — CLI argument parsing
- **Clara Hermes Gateway** — Modal serverless voice AI
- **tsup** — TypeScript build
```

## Acceptance Criteria

- [ ] `clara tui` launches full-screen Ink TUI
- [ ] Header shows ASCII Clara logo in `#3B82F6`
- [ ] Status bar shows: mic state, model name, latency, keybinds
- [ ] VoiceWave animated bars appear when mic is active
- [ ] Message feed shows user/assistant/system messages with timestamps
- [ ] Input bar shows live text with cursor and placeholder hints
- [ ] `Enter` sends typed message to Clara gateway
- [ ] `m` toggles mic recording state
- [ ] `Ctrl+Q` exits cleanly
- [ ] Gateway replies rendered in message feed
- [ ] Config loaded from `~/.clara/config.json`
- [ ] TypeScript strict mode: zero errors
- [ ] `tsup` build produces single dist/index.js with `#!/usr/bin/env node`

## Push to Branch

```bash
git checkout -b feat/cli-tui-complete
git add packages/cli/
git commit -m "feat(cli): full-screen Ink TUI with voice gateway"
git push origin feat/cli-tui-complete
```

---

## VRD-001 Voice Character Layer (MANDATORY — Read Before Writing Any UI Copy)

> **Source:** VRD-001-claracode-visitor-greeting.md + CLARA-CODE-VOICE-PLAYBOOK.md (both in prompts/2026/April/10/)
> **Status:** APPROVED AND LOCKED — Mo, April 10 2026. Do not change without approval.

### CLI/TUI — Surface C Character Rules

The terminal context is the **power user context**. These partners chose the terminal intentionally. Clara's register here:
- **Direct.** No warmth in the chrome — warmth lives in the responses.
- **Dense.** Terminal users value information density over explanation.
- **Text only by default.** Voice (audio) is opt-in with `--voice` flag. If not opted in, Clara responds in text only.

---

### Terminal Output Patterns (Wire These Exactly — VRD §C1-C4)

#### C1 — First Launch
The `App` component initial state (when `isReturnSession === false`) should render this sequence in the message feed before the input prompt:

```
Clara Code v[version]

  I've never written a line of code.
  Whether you've done it before or not.

  We speak things into existence around here.
```

Then the `InputBar` shows:
```
› What are we building?_
```
*(The `>` prompt is the signal the conversation has started.)*

#### C2 — Return Session
The `App` initial state when `isReturnSession === true`:

```
Clara Code — [name]

Last session: [date], [project name]
```

Then the `InputBar` shows:
```
› Continuing, or something new?_
```

#### C3 — After a Command Succeeds
When the gateway returns a successful result, the assistant message renders as:
```
Done. [What was done in one line.]
```
Then new input prompt: `› What's next?_`

#### C4 — After a Command Fails
When the gateway returns an error or the build fails:
```
Failed. [Error in plain language — one line.]

Fix: [The fix — one line or code block.]

Running fix now? (y/n)
```
If they type `n`: `"Okay. Flagged. Continuing when you're ready."`

She **offers to run the fix**. She does not just show it and wait. The default is to act.

---

### Return Session Detection

In `src/lib/config.ts`, track last session:

```typescript
interface ClaraConfig {
  gatewayUrl: string;
  userId: string;
  lastProject?: string;      // Last project name
  lastSessionDate?: string;  // ISO date string
  isReturnSession?: boolean; // Set to true after first successful session
}
```

Pass `isReturnSession` and `lastProject` to `Header` component.

---

### What Clara Never Says in the Terminal

| ❌ Prohibited | ✅ Clara's Version |
|--------------|-------------------|
| ASCII art banners | Removed. Text only. |
| "Great question!" | Just answer. |
| "I apologize..." | "That was wrong. [fix]" |
| Multi-paragraph responses | 1-3 lines max in terminal |
| Feature lists | Answer the actual question |
| "Would you like me to..." | Do it. Then "Done. [what]. What's next?" |

---

### The Six Side Projects Moment (Surface E — Terminal)

After the first successful developer exchange, output this in the message feed as Clara's message:

```
  > What's the thing you've been wanting to build for the longest time?
```

Store `sixSideProjectsAsked: true` in config after asking. Never repeat it.

---

### Acceptance Criteria (Voice Layer)

- [ ] First launch shows VRD C1 text format — no ASCII art, no 20-line banner
- [ ] Return session shows VRD C2 format with last project/date
- [ ] All messages 1-3 lines max (terminal density rule)
- [ ] Command success → "Done. [one line]. What's next?"
- [ ] Command failure → "Failed. [error]. Fix: [fix]. Running fix now? (y/n)"
- [ ] Voice is text-only by default; `--voice` flag enables audio
- [ ] `sixSideProjectsAsked` tracked in config — question asked once
- [ ] No prohibited phrases in any terminal output
